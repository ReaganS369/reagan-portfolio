<!-- @format -->

# Encoding a scroll-scrubbed video

The Journey timeline (`src/features/about/components/public/JourneyScrub.tsx`)
does not play its background clip. It **seeks** it: scroll position through the
section maps to a playback time, and the component sets `currentTime` every
animation frame. Any clip driven this way has to be encoded for seeking, which
is not how a delivery encode normally looks.

## Why the source render can't be used directly

A normal H.264 encode only stores a full picture (a keyframe) every few seconds;
every frame in between is a delta that can only be decoded by replaying the
whole group of pictures from the last keyframe. The original Higgsfield render
was one such file — 10.04 s, 241 frames, and exactly **2 keyframes** (one at
frame 0, the next at frame 170).

Seeking to frame 120 in that file means decoding 120 frames. At scroll speed the
browser can't keep up, coalesces the requests, and drops most of them — so the
background sat on frame 0 for seven seconds of scrolling and then snapped to
frame 170. It read as a still image that occasionally jumped, which is the exact
artefact the scrub is supposed to avoid.

The fix is an **all-intra** encode: every frame is a keyframe, so every seek is
a single-frame decode.

## The recipe

```bash
ffmpeg -y -i journey-source.mp4 \
  -an \
  -vf "scale=960:540:flags=lanczos" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -bf 0 -sc_threshold 0 \
  -crf 26 -preset slow \
  -movflags +faststart \
  journey.mp4
```

| Flag                        | Why                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `-g 1 -keyint_min 1`        | One-frame GOPs — every frame becomes a keyframe. This is the whole point.                         |
| `-bf 0`                     | No B-frames. B-frames depend on later frames, which defeats single-frame seeking.                 |
| `-sc_threshold 0`           | Stops ffmpeg inserting its own extra keyframes on scene changes; with `-g 1` they'd be redundant. |
| `-movflags +faststart`      | Moves `moov` ahead of `mdat` so duration is known from the first bytes and seeking can start.     |
| `-an`                       | The clip is a muted background; audio is dead weight.                                             |
| `scale=960:540`             | It sits behind a scrim, a vignette and grain — 540p is indistinguishable from 720p here.          |
| `-crf 26`                   | Tuned so the all-intra build lands at roughly the source's file size (see below).                |

All-intra costs bandwidth, so resolution and CRF are what buy it back. For this
clip the trade came out neutral:

| Build                     | Resolution | Keyframes | Size    |
| ------------------------- | ---------- | --------- | ------- |
| source render             | 1280×720   | 2         | 4.03 MB |
| scrub build (`-crf 26`)   | 960×540    | 241 (all) | 4.24 MB |

For reference: `-crf 23` → 5.69 MB, `-crf 29` → 3.14 MB at the same resolution.

## Verifying a build

`stss` is the MP4 box listing sync samples. When **every** frame is a keyframe
the box is omitted entirely, so its absence is the pass condition:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries frame=key_frame -of csv=p=0 journey.mp4 | sort | uniq -c
# want: a single line, "<frame count> 1" — no zeroes
```

## Publishing

Both files live in Supabase Storage under `nngtw-assets/videos/`; nothing is
committed to git and nothing ships in `public/` (see `.gitignore`).

- `videos/journey.mp4` — the all-intra scrub build the site loads.
- `videos/journey-source.mp4` — the untouched master, archived so this encode
  can be redone. Never referenced by the app.

Upload with the service-role key via the Storage API (`x-upsert: true`). Note
that upserting an existing object keeps the original object's `cacheControl`
metadata — delete and re-create it if the cache header needs to change.
