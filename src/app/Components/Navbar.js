// components/Navbar.js
'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {

  const router = useRouter()

  return (
    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <a className="nav-item nav-link px-0 me-xl-6" href="#">
          <i className="ri-menu-fill ri-22px"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {/* Search */}
        <div className="navbar-nav align-items-center">
          <div className="nav-item navbar-search-wrapper mb-0">
            <a className="nav-item nav-link search-toggler fw-normal px-0" href="#">
              <i className="ri-search-line ri-22px scaleX-n1-rtl me-3"></i>
              <span className="d-none d-md-inline-block text-muted">Search (Ctrl+/)</span>
            </a>
          </div>
        </div>
        {/* /Search */}

        <ul className="navbar-nav flex-row align-items-center ms-auto">
          {/* Language Dropdown */}
          <li className="nav-item dropdown">
            <a className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <i className="ri-translate-2 ri-22px"></i>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              {['English', 'French', 'Arabic', 'German'].map((lang, i) => (
                <li key={i}>
                  <a className="dropdown-item" href="#">
                    <span className="align-middle">{lang}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* Style Switcher */}
          <li className="nav-item dropdown me-1 me-xl-0">
            <a className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <i className="ri-contrast-drop-line ri-22px"></i>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              {['Light', 'Dark', 'System'].map((theme, i) => (
                <li key={i}>
                  <a className="dropdown-item" href="#">
                    <span className="align-middle">
                      <i className={`ri-${theme === 'Light' ? 'sun' : theme === 'Dark' ? 'moon-clear' : 'computer'}-line ri-22px me-3`}></i>
                      {theme}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* Notifications (simplified) */}
          <li className="nav-item dropdown me-4 me-xl-1">
            <a className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <i className="ri-notification-2-line ri-22px"></i>
              <span className="position-absolute top-0 start-50 translate-middle-y badge badge-dot bg-danger mt-2 border"></span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li className="dropdown-menu-header border-bottom py-50">
                <div className="dropdown-header d-flex align-items-center py-2">
                  <h6 className="mb-0 me-auto">Notification</h6>
                </div>
              </li>
              <li className="dropdown-item">You have new notifications</li>
            </ul>
          </li>

          {/* User Menu */}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <div className="avatar avatar-online">
                <Image src="/assets/img/avatars/1.png" alt="Avatar" className="rounded-circle" width={40} height={40} />
              </div>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-2">
                      <div className="avatar avatar-online">
                        <Image src="/assets/img/avatars/1.png" alt="Avatar" className="rounded-circle" width={40} height={40} />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block small">John Doe</span>
                      <small className="text-muted">Admin</small>
                    </div>
                  </div>
                </a>
              </li>
              <li><div className="dropdown-divider"></div></li>
              <li><Link className="dropdown-item" href="#"><i className="ri-user-3-line ri-22px me-3"></i>My Profile</Link></li>
              <li><Link className="dropdown-item" href="#"><i className="ri-settings-4-line ri-22px me-3"></i>Settings</Link></li>
              <li><div className="d-grid px-4 pt-2 pb-1"><a className="btn btn-sm btn-danger d-flex" href="#"><small className="align-middle" onClick={()=>{localStorage.clear(); router.replace('/AdminLogin')}}>Logout</small></a></div></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
