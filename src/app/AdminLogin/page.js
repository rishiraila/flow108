'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ Hardcoded credentials check
    if (username === 'coinage@admin.com' && password === 'admin123') {
      setSuccessMsg('Login Successful! Redirecting...');
      setTimeout(() => {
        router.push('/Users');
      }, 1000);
    } else {
      alert('Invalid email or password!');
    }
  };

  return (
    <div className="authentication-wrapper authentication-cover">
      <Link
        href="/"
        className="auth-cover-brand d-flex align-items-center gap-2"
      >
        <img src="/assets/img/branding/flow108_logo_recolored.png" width="80" alt="Logo" />
        <span className="app-brand-text demo text-heading fw-semibold">
          Flow 108
        </span>
      </Link>

      <div className="authentication-inner row m-0">
        <div className="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center justify-content-center p-12 pb-2">
          <img
            src="/assets/img/illustrations/auth-login-illustration-light.png"
            className="auth-cover-illustration w-100"
            alt="auth-illustration"
          />
          <img
            src="/assets/img/illustrations/auth-cover-login-mask-light.png"
            className="authentication-image"
            alt="mask"
          />
        </div>

        <div className="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-12 px-12 py-6">
          <div className="w-px-400 mx-auto pt-5 pt-lg-0">
            <h4 className="mb-1">Welcome to Flow 108! 👋</h4>
            <p className="mb-5">
              Please sign in with your admin credentials
            </p>

            {successMsg && <div className="text-success mb-3">{successMsg}</div>}

            <form onSubmit={handleLogin} className="mb-5">
              <div className="form-floating form-floating-outline mb-5">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <label htmlFor="username">Email</label>
              </div>

              <div className="mb-5">
                <div className="form-password-toggle">
                  <div className="input-group input-group-merge">
                    <div className="form-floating form-floating-outline">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                    <span
                      className="input-group-text cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i
                        className={
                          showPassword ? 'ri-eye-line' : 'ri-eye-off-line'
                        }
                      ></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-5 d-flex justify-content-between mt-5">
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="remember-me"
                  />
                  <label className="form-check-label" htmlFor="remember-me">
                    Remember Me
                  </label>
                </div>
                <Link href="/Forgot" className="float-end mb-1 mt-2">
                  <span>Forgot Password?</span>
                </Link>
              </div>

              <button type="submit" className="btn btn-primary d-grid w-100">
                Sign in
              </button>
            </form>

            <p className="text-center">
              <span>New to Camrilla? </span>
              <Link href="/Signup">
                <span>Create an account</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
