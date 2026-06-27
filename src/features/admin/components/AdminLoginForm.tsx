'use client';

/** @format */

import { useActionState } from 'react';
import {
  loginAdmin,
  type AdminLoginState,
} from '@/src/features/admin/actions/auth';

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <form className="admin-login-form" action={formAction}>
      <div className="admin-login-form__field">
        <label className="admin-login-form__label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          className="admin-login-form__input"
          placeholder="Enter admin password"
          autoComplete="current-password"
          required
          disabled={isPending}
        />
      </div>

      {state.error && (
        <p className="admin-login-form__error" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        className="admin-btn admin-btn--primary admin-btn--md admin-login-form__submit"
        disabled={isPending}
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
