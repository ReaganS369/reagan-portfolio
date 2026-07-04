/** @format */

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { RegionId } from './data/skillsData';

interface SkillsLabState {
  /** currently zoomed body region (null = full body) */
  region: RegionId | null;
  /** breadcrumb of node ids inside the region */
  path: string[];
  focusRegion: (region: RegionId | null, path?: string[]) => void;
  pushNode: (nodeId: string) => void;
  popTo: (depth: number) => void; // 0 = region root
  reset: () => void;
}

const Ctx = createContext<SkillsLabState | null>(null);

export function SkillsLabProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<RegionId | null>(null);
  const [path, setPath] = useState<string[]>([]);

  const focusRegion = useCallback((r: RegionId | null, p: string[] = []) => {
    setRegion(r);
    setPath(p);
  }, []);

  const pushNode = useCallback((nodeId: string) => {
    setPath((prev) => [...prev, nodeId]);
  }, []);

  const popTo = useCallback((depth: number) => {
    setPath((prev) => prev.slice(0, depth));
  }, []);

  const reset = useCallback(() => {
    setRegion(null);
    setPath([]);
  }, []);

  const value = useMemo(
    () => ({ region, path, focusRegion, pushNode, popTo, reset }),
    [region, path, focusRegion, pushNode, popTo, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSkillsLab(): SkillsLabState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSkillsLab must be used inside SkillsLabProvider');
  return ctx;
}
