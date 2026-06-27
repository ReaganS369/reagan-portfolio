/** @format */

import AdminLoginForm from '@/src/features/admin/components/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__logo" aria-hidden="true">N</span>
          <div>
            <h1 className="admin-login__title">NNGTW Admin</h1>
            <p className="admin-login__subtitle">Sign in to manage your portfolio</p>
          </div>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
