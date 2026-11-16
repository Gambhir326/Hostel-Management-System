/**
 * pages/Signup.js — Multi-Role Registration Page
 * -------------------------------------------------
 * Supports role selection: Student or Parent
 *
 * Student fields: name, rollNumber, email, contact, hostelName, roomNumber, password
 * Parent fields:  name, email, contact, linkedStudentRollNumber, password
 *
 * Security:
 *   - Password hashed server-side with bcrypt (register.js)
 *   - Duplicate email/rollNumber detected and shown as error
 */

import React, { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Router from 'next/router'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/Signup.module.css'

export default function Signup() {
  const { isDark } = useTheme()

  // Which role the user is signing up as
  const [role, setRole] = useState('student')

  // Form loading state while API call is in-flight
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Collect form values by name attribute
    const f = e.target
    const payload = {
      role,
      name:     f.name?.value,
      email:    f.email?.value,
      contact:  f.contact?.value,
      password: f.password?.value,
    }

    // Student-specific
    if (role === 'student') {
      payload.rollNumber  = f.rollNumber?.value
      payload.hostelName  = f.hostelName?.value
      payload.roomNumber  = f.roomNumber?.value
    }

    // Parent-specific
    if (role === 'parent') {
      payload.linkedStudentRollNumber = f.linkedStudentRollNumber?.value
    }

    try {
      const res = await axios.post('/api/register', payload)
      if (res.status === 201) {
        toast.success('Account created! Redirecting to login…')
        setTimeout(() => Router.push('/Login'), 1200)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <Head><title>Sign Up — HMS</title></Head>
      <Toaster position="top-center" />

      <Navbar />

      <div className={styles.center}>
        <div className={styles.card}>

          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>It won&apos;t take long.</p>

          {/* ---- ROLE SELECTOR ----------------------------- */}
          <div className={styles.roleSelector}>
            {['student', 'parent'].map(r => (
              <button
                key={r}
                type="button"
                className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                onClick={() => setRole(r)}
              >
                {r === 'student' ? '🎓 Student' : '👨‍👩‍👧 Parent'}
              </button>
            ))}
          </div>

          {/* ---- FORM --------------------------------------- */}
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Common fields */}
            <input name="name"     type="text"     placeholder="Full name"       required />
            <input name="email"    type="email"    placeholder="Email address"   required />
            <input name="contact"  type="tel"      placeholder="Phone number"    required />
            <input name="password" type="password" placeholder="Choose a password" required minLength={8} />

            {/* Student-only fields */}
            {role === 'student' && (
              <>
                <input name="rollNumber"  type="number" placeholder="Roll / Registration number" required />
                <input name="hostelName"  type="text"   placeholder="Hostel name"                required />
                <input name="roomNumber"  type="text"   placeholder="Room number"                required />
              </>
            )}

            {/* Parent-only fields */}
            {role === 'parent' && (
              <div className={styles.highlightField}>
                <label className={styles.fieldLabel}>
                  🎓 Your child&apos;s registration number
                </label>
                <input
                  name="linkedStudentRollNumber"
                  type="number"
                  placeholder="Student registration / roll number"
                  required
                />
                <p className={styles.fieldHint}>
                  This links your account to your child&apos;s hostel profile.
                </p>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up →'}
            </button>

          </form>

          <p className={styles.loginLink}>
            Already have an account?{' '}
            <span onClick={() => Router.push('/Login')} className={styles.link}>
              Log in
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}
