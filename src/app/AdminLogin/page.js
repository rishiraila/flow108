'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

export default function Page() {
  console.log('firebase');
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleLogin = async () => {
    setSuccessMsg('');

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Firebase ID Token:', idToken);

      // Call the API with the token
      const response = await fetch('https://api.flow108.in/api/AdminAccount/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirebaseIdToken: idToken
        })
      });

      const data = await response.json();

      if (response.ok && data.Status) {
        setSuccessMsg('Login Successful! Redirecting...');
        // Store the JWT token returned from backend, not the Firebase token
        const jwtToken = data.Data; // Assuming the JWT token is in the Data field
        console.log('🔑 JWT Token received from backend:', jwtToken);

        // Decode JWT token to see payload
        try {
          const payload = jwtToken.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          console.log('🔓 Decoded JWT Payload:', decodedPayload);
          console.log('👤 User ID from JWT:', decodedPayload.sub || decodedPayload.userId || decodedPayload.UserId || decodedPayload.jti || decodedPayload.email);
          console.log('📧 Email from JWT:', decodedPayload.email);
          console.log('🔑 JWT ID (jti):', decodedPayload.jti);
          console.log('👑 Admin Role:', decodedPayload.admin_role);

          // Store admin ID for use in Questions page
          const adminId = decodedPayload.sub || decodedPayload.userId || decodedPayload.UserId || decodedPayload.jti || decodedPayload.email;
          if (adminId) {
            localStorage.setItem('adminId', adminId);
            console.log('💾 Admin ID stored in localStorage:', adminId);
          }
        } catch (decodeError) {
          console.error('❌ Error decoding JWT:', decodeError);
        }

        localStorage.setItem('adminToken', jwtToken);
        localStorage.setItem('adminEmail', user.email);
        setTimeout(() => {
          router.push('/Dashboard');
        }, 1000);
      } else {
        alert(data.Message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Google sign-in failed. Please try again.');
    }
  };

  return (
    <>
      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>

        {/* Main content (flex-grow-1 to push footer down) */}
        <div className="authentication-wrapper authentication-cover flex-grow-1 d-flex flex-column overflow-auto">

          <Link
            href="/"
            className="auth-cover-brand d-flex align-items-center gap-2"
          >
            <img src="/assets/img/branding/flow108_logo_recolored.png" width="80" alt="Logo" />
            <span className="app-brand-text demo text-heading fw-semibold">
              Flow 108
            </span>
          </Link>

          <div className="authentication-inner row m-0 flex-grow-1 d-flex overflow-auto">
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
              <div className="w-px-400 mx-auto pt-5 pt-lg-0 d-flex flex-column flex-grow-1 overflow-auto">
                <h4 className="mb-1">Welcome to Flow 108! 👋</h4>
                <p className="mb-5">
                  Please sign in with your admin credentials
                </p>

                {successMsg && <div className="text-success mb-3">{successMsg}</div>}

                <div className="mb-5 flex-grow-1 d-flex flex-column">
                  <button
                    onClick={handleGoogleLogin}
                    className="btn btn-outline-secondary d-grid w-100 mt-auto d-flex align-items-center justify-content-center gap-2"
                    style={{
                      border: '1px solid #dadce0',
                      backgroundColor: '#fff',
                      color: '#3c4043',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>

               
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="text-center py-3 w-100" style={{
          fontSize: "0.9rem",
          color: "#6c757d",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #dee2e6"
        }}>
          <p className="mb-1">
            © 2025 <a href="https://www.coinagesoft.com/" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary fw-bold">Coinage Software</a> All rights reserved.
          </p>
          <p className="mb-0">
            <Link href="/terms" className="text-decoration-none text-muted mx-2">Terms and Conditions</Link>|
            <Link href="/cancellation-refund" className="text-decoration-none text-muted mx-2">Cancellation & Refund Policy</Link>|
            <Link href="/shipping-delivery" className="text-decoration-none text-muted mx-2">Shipping & Delivery Policy</Link>|
            <Link href="/privacy" className="text-decoration-none text-muted mx-2">Privacy Policy</Link>
            {/* <Link href="/contact" className="text-decoration-none text-muted mx-2">Contact Us</Link> */}
          </p>
        </footer>

      </div>
    </>
  );
}
