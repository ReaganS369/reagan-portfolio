/** @format */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { getHeroRoles } from '../api/heroRoles';
import {
  getSocialLinks,
  type SocialLink,
} from '@/src/features/social-links/api/social-links';
import type { HeroRole, UserProfile } from '../types';

interface HeroData {
  profile: UserProfile | null;
  roles: HeroRole[];
  socialLinks: SocialLink[];
}

export function useHeroData(): HeroData {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<HeroRole[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').single();
      setProfile(data);
    }

    async function loadRoles() {
      try {
        const data = await getHeroRoles();
        setRoles(data ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadSocialLinks() {
      try {
        const data = await getSocialLinks();
        setSocialLinks(data ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
    loadRoles();
    loadSocialLinks();
  }, []);

  return { profile, roles, socialLinks };
}
