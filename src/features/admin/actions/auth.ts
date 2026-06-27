'use server';

/** @format */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminPassword } from '@/src/lib/auth/admin-password';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/src/lib/auth/admin-session';

export type AdminLoginState = {
  error?: string;
};

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: 'Admin authentication is not configured.' };
  }

  if (typeof password !== 'string' || !verifyAdminPassword(password, adminPassword)) {
    return { error: 'Invalid password.' };
  }

  const token = await createAdminSessionToken(adminPassword);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());

  redirect('/admin');
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}
