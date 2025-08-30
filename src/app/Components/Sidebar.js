"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/Dashboard", icon: "ri-dashboard-line", label: "Dashboard" },
    {
      label: "Users",
      icon: "ri-user-line",
      submenu: [
        { href: "/Users", label: "All Users", icon: "ri-user-3-line" },
        {
          href: "/SuperUsers",
          label: "Super Users",
          icon: "ri-shield-user-line",
        },
      ],
    },
    {
      href: "/Subscriptions",
      icon: "ri-vip-crown-line",
      label: "Subscriptions",
    },
    
     {
      label: "Workouts",
      icon: "ri-run-line",
      submenu: [
      { href: "/Exercise", icon: "ri-run-line", label: "Plans" },
        { href: "/Workouts", label: "Exercise", icon: "ri-run-line" },
      ],
    },
    { href: "/Forumn", icon: "ri-discuss-line", label: "Forum" },
    { href: "/Questions", icon: "ri-question-answer-line", label: "Questions" },
    { href: "/Coupons", icon: "ri-coupon-3-line", label: "Coupons" },
    {
      href: "/PushNotification",
      icon: "ri-notification-3-line",
      label: "Push Notification",
    },
    {
      label: "Diet",
      icon: "ri-restaurant-line",
      submenu: [
        { href: "/DietPlan", label: "Diet Plans", icon: "ri-clipboard-line" },
       
        { href: "/Recipies", label: "Recipes", icon: "ri-knife-line" },
       
      ],
    },
  ];

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <Link href="/" className="app-brand-link">
          <span className="app-brand-logo demo mt-2">
            <img
              src="/assets/img/branding/flow108_logo_recolored.png"
              alt="Logo"
              width="70"
              height="70"
            />
          </span>
          <span className="app-brand-text demo menu-text fw-semibold ms-2 ">
            Flow 108
          </span>
        </Link>
        <a href="#" className="layout-menu-toggle menu-link text-large ms-auto">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG paths... */}
          </svg>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1 mt-1">
        {menuItems.map((item) => {
          if (item.submenu) {
            return (
              <li
                key={item.label}
                className={`menu-item ${
                  item.submenu.some((sub) => pathname.startsWith(sub.href))
                    ? "active open"
                    : ""
                }`}
              >
                <a href="#" className="menu-link menu-toggle">
                  <i className={`menu-icon tf-icons ${item.icon}`}></i>
                  <div>{item.label}</div>
                </a>
                <ul className="menu-sub">
                  {item.submenu.map((sub) => (
                    <li
                      key={sub.href}
                      className={`menu-item${
                        pathname === sub.href ? " active" : ""
                      }`}
                    >
                      <Link href={sub.href} className="menu-link">
                        <div>{sub.label}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          return (
            <li
              key={item.href}
              className={`menu-item${
                pathname.startsWith(item.href) ? " active" : ""
              }`}
            >
              <Link href={item.href} className="menu-link">
                <i className={`menu-icon tf-icons ${item.icon}`}></i>
                <div>{item.label}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
