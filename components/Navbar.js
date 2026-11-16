/**
 * components/Navbar.js — Responsive Navigation Bar
 * --------------------------------------------------
 * Adapts to all screen sizes:
 *   Desktop  (> 768px) : Full row — logo | date | email | role badge | theme toggle
 *   Tablet  (480-768px): Logo | theme toggle | ☰ hamburger
 *   Mobile   (< 480px) : Logo only + ☰ → slide-down drawer with all items
 *
 * Uses global ThemeContext for dark/light mode.
 * Role badge shows the user's current role with a colour.
 *
 * Props:
 *   email   : logged-in user's email to show in nav
 *   role    : 'student' | 'parent' | 'warden' | 'masterAdmin'
 *   logOut  : if truthy, shows Logout button
 */

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useTheme } from '../Context/ThemeContext'
import styles from './Navbar.module.css'

// Role → display label + colour class
const ROLE_META = {
  student:     { label: 'Student',      cls: styles.roleStudent },
  parent:      { label: 'Parent',       cls: styles.roleParent },
  warden:      { label: 'Warden 🔑',    cls: styles.roleWarden },
  masterAdmin: { label: 'Master Admin 👑', cls: styles.roleMaster },
}

// Role → dashboard link
const ROLE_DASHBOARD = {
  student:     '/StudentDashboard',
  parent:      '/ParentDashboard',
  warden:      '/WardenDashboard',
  masterAdmin: '/MasterDashboard',
}

const Navbar = ({ email, role, logOut }) => {
  const { isDark, toggleTheme } = useTheme()

  // Hamburger menu open/closed state
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu if user clicks outside
  const navRef = useRef(null)
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const roleMeta = ROLE_META[role] || null
  const dashboardHref = ROLE_DASHBOARD[role] || '/'

  return (
    <nav
      ref={navRef}
      className={`${styles.navbar} ${isDark ? styles.dark : ''}`}
    >
      {/* ---- MAIN ROW ------------------------------------ */}
      <div className={styles.row}>

        {/* LEFT: Brand */}
        <Link href={dashboardHref} className={styles.brand}>
          <span className={styles.brandBold}>Hostel</span>
          <span className={styles.brandLight}> Management System</span>
        </Link>

        {/* CENTER: Date (hidden on small screens via CSS) */}
        <span className={styles.date}>
          {new Date().toDateString()}
        </span>

        {/* RIGHT: Controls */}
        <div className={styles.controls}>

          {/* Email (hidden on mobile) */}
          {email && (
            <span className={styles.email}>{email}</span>
          )}

          {/* Role badge (hidden on mobile) */}
          {roleMeta && (
            <span className={`${styles.roleBadge} ${roleMeta.cls}`}>
              {roleMeta.label}
            </span>
          )}

          {/* Theme toggle — always visible */}
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Logout button — desktop only, only if logOut prop passed */}
          {logOut && (
            <button
              className={`${styles.logoutBtn} ${styles.desktopOnly}`}
              onClick={() => signOut({ callbackUrl: '/Login' })}
            >
              Logout
            </button>
          )}

          {/* Hamburger button — mobile / tablet only */}
          <button
            className={`${styles.iconBtn} ${styles.hamburger}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Open menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ---- MOBILE DRAWER ------------------------------- */}
      {menuOpen && (
        <div className={`${styles.drawer} ${isDark ? styles.drawerDark : ''}`}>

          {email && (
            <div className={styles.drawerEmail}>{email}</div>
          )}

          {roleMeta && (
            <span className={`${styles.roleBadge} ${roleMeta.cls} ${styles.drawerBadge}`}>
              {roleMeta.label}
            </span>
          )}

          <Link href={dashboardHref} className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
            📊 Dashboard
          </Link>

          <Link href="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
            🏠 Home
          </Link>

          {logOut && (
            <button
              className={styles.drawerLogout}
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/Login' }) }}
            >
              🚪 Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
