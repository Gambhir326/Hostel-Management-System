/**
 * Hero.js — Login Form Component
 * --------------------------------
 * This is the main login card rendered on the /Login page.
 * It contains:
 *   - Email + Password inputs (controlled via React state)
 *   - A login button that calls NextAuth's `signIn`
 *   - Links to Signup and Home pages
 *   - A <Guest /> component for guest login option
 *
 * Theme is managed globally via ThemeContext (Context/ThemeContext.js).
 * The toggle button in the Navbar also controls this same theme.
 */

import { Button } from '@mui/material'
import React, { useState } from 'react'
import styles from './Hero.module.css'
import { useTheme } from '../Context/ThemeContext'
import Link from 'next/link'
import Router from 'next/router'
import { signIn } from 'next-auth/react'
import Guest from './Guest'

const Hero = () => {
  // ---- FORM STATE -------------------------------------------
  // Tracks what the user has typed into the email & password fields.
  // These are "controlled inputs" — React owns the value.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ---- ERROR MESSAGE STATE ----------------------------------
  // If login fails, this holds the error string shown in red.
  const [message, setMessage] = useState(null)

  // ---- THEME (from global ThemeContext) --------------------
  // isDark and toggleTheme come from ThemeContext so the toggle
  // button in the Navbar controls the same theme as this card.
  const { isDark, toggleTheme } = useTheme()

  // ---- LOGIN HANDLER ----------------------------------------
  // Called on "login" button click.
  // Uses NextAuth's `signIn` with the 'credentials' provider.
  // On success → redirects to the dashboard matching the user's role
  // On failure → shows error message on the login card
  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    // Build options for NextAuth credentials login
    const options = { redirect: false, email, password }
    const res = await signIn('credentials', options)

    // If NextAuth returns an error, show it on the card
    if (res?.error) {
      if (res.error === 'CredentialsSignin' || res.error === 'undefined') {
        setMessage('Invalid email or password. Please verify your credentials.')
      } else {
        setMessage(res.error)
      }
      return
    }

    // Success — fetch session to get the role, then redirect accordingly
    // We import getSession dynamically to avoid SSR issues
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    const role = session?.user?.role

    const ROLE_ROUTES = {
      masterAdmin: '/MasterDashboard',
      warden:      '/WardenDashboard',
      parent:      '/ParentDashboard',
      student:     '/StudentDashboard',
    }

    return Router.push(ROLE_ROUTES[role] || '/StudentDashboard')
  }

  return (
    <div className={styles.pageWrapper}>
    <div className={`${styles.container} ${isDark ? styles.dark : ''}`}>

      {/* ---- THEME TOGGLE BUTTON ----------------------------
          Shows 🌙 when in light mode (click to go dark)
          Shows ☀️  when in dark mode (click to go light)
      ---------------------------------------------------- */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        title="Toggle dark / light mode"
        aria-label="Toggle theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* ---- HEADING ---------------------------------------- */}
      <h2>let&apos;s log you in!</h2>

      {/* ---- LOGIN FORM -------------------------------------
          method/action are legacy attributes; actual submit
          is handled by handleSubmit via onClick on the button.
      ---------------------------------------------------- */}
      <form
        method="post"
        action="/api/login"
        className={styles.formContainer}
      >
        {/* Email input — onChange updates `email` state */}
        <input
          type="email"
          name="email"
          placeholder="university email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input — onChange updates `password` state */}
        <input
          type="password"
          name="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot password link */}
        <div style={{ width: '100%', textAlign: 'right', marginTop: '2px', marginBottom: '8px' }}>
          <Link href="/ForgotPassword">
            <span style={{
              fontSize: '0.8rem',
              color: isDark ? '#64b5f6' : '#b05e1a',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}>
              Forgot password?
            </span>
          </Link>
        </div>

        {/* Login button — triggers handleSubmit */}
        <Button
          variant="outlined"
          color="success"
          onClick={handleSubmit}
          style={{ marginTop: '10px' }}
        >
          login
        </Button>
      </form>

      {/* ---- ERROR MESSAGE ----------------------------------- */}
      {/* Shows lockout / wrong password message from the firewall */}
      {message && (
        <p style={{
          color: '#d32f2f',
          fontSize: '0.85rem',
          marginTop: '12px',
          textAlign: 'center',
          background: 'rgba(211,47,47,0.08)',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(211,47,47,0.2)',
          maxWidth: '300px',
        }}>
          ⚠️ {message}
        </p>
      )}

      {/* ---- SIGN UP LINK ----------------------------------- */}
      <h5>
        don&apos;t have an account?{' '}
        <Link href="/Signup">
          <span className={styles.signUpText}>sign up</span>
        </Link>
      </h5>

      {/* ---- HOME BUTTON ------------------------------------ */}
      <Link href="/">
        <Button variant="outlined" style={{ marginTop: '10px' }}>
          Home Page
        </Button>
      </Link>

      {/* ---- GUEST LOGIN ------------------------------------ */}
      {/* Guest.js renders an option to log in as a demo/guest user */}
      <Guest />
    </div>
    </div>
  )
}

export default Hero