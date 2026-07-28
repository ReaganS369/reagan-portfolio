/** @format */

'use client';

import { useState, useEffect } from 'react';
import { getProfile } from '@/src/features/profile/api/profile';
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
  isLoading: boolean;
}

export function useHeroData(): HeroData {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<HeroRole[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await getProfile();
        if (active) setProfile(data);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadRoles() {
      try {
        const data = await getHeroRoles();
        if (active) setRoles(data ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadSocialLinks() {
      try {
        const data = await getSocialLinks();
        if (active) setSocialLinks(data ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    Promise.allSettled([loadProfile(), loadRoles(), loadSocialLinks()]).then(
      () => {
        if (active) setIsLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return { profile, roles, socialLinks, isLoading };
}
