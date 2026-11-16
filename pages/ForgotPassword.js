/**
 * pages/ForgotPassword.js — Account Recovery with OTP Verification
 * -------------------------------------------------------------------
 * Flow:
 *   1. User inputs registered Email or Contact number.
 *   2. Server generates 6-digit OTP code (valid 10 minutes).
 *   3. User inputs the OTP along with their new password.
 *   4. Password is encrypted with bcrypt and account is unlocked.
 */

import React, { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Router from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/ForgotPassword.module.css'

export default function ForgotPassword() {
  const { isDark } = useTheme()

  // Step 1 = Request OTP, Step 2 = Enter OTP & Set New Password
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)
  const [previewOtp, setPreviewOtp] = useState(null)
  const [maskedContact, setMaskedContact] = useState('')

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setMessage(null)
    setIsError(false)
    setLoading(true)

    try {
      const res = await axios.post('/api/auth/send-otp', { identifier })
      if (res.status === 200) {
        setStep(2)
        setMessage(res.data.message)
        setIsError(false)
        if (res.data.maskedContact) setMaskedContact(res.data.maskedContact)
        if (res.data.previewOtp) setPreviewOtp(res.data.previewOtp)
      }
    } catch (err) {
      setIsError(true)
      setMessage(err.response?.data?.message || 'Failed to send OTP. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setMessage(null)
    setIsError(false)

    if (newPassword.length < 8) {
      setIsError(true)
      setMessage('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setIsError(true)
      setMessage('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    try {
      const res = await axios.post('/api/auth/reset-password', {
        identifier,
        otp,
        newPassword,
      })

      if (res.status === 200) {
        setIsError(false)
        setMessage('🎉 Password reset successfully! Redirecting to login…')
        setTimeout(() => {
          Router.push('/Login')
        }, 1800)
      }
    } catch (err) {
      setIsError(true)
      setMessage(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <Head>
        <title>Reset Password — HMS</title>
      </Head>
      <Navbar />

      <main className={styles.center}>
        <div className={styles.card}>

          <div className={styles.header}>
            <span className={styles.icon}>{step === 1 ? '🔐' : '📱'}</span>
            <h1 className={styles.title}>
              {step === 1 ? 'Reset Password' : 'Enter OTP Code'}
            </h1>
            <p className={styles.subtitle}>
              {step === 1
                ? 'Enter your registered email or mobile number to receive a verification code.'
                : `We sent a 6-digit OTP code to your registered contact ${maskedContact ? `(${maskedContact})` : ''}.`}
            </p>
          </div>

          {message && (
            <div className={`${styles.alert} ${isError ? styles.alertError : styles.alertSuccess}`}>
              <span>{isError ? '⚠️' : '✅'}</span>
              <span>{message}</span>
            </div>
          )}

          {/* Dev helper note */}
          {previewOtp && (
            <div className={styles.otpBadge}>
              🧪 <strong>Dev Preview OTP:</strong> {previewOtp}
            </div>
          )}

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email or Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. gambhir@gmail.com or 7005653328"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send Verification OTP →'}
              </button>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${styles.input} ${styles.otpInput}`}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Updating Password…' : 'Verify OTP & Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#64b5f6' : '#b05e1a',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  disabled={loading}
                >
                  Didn&apos;t receive code? Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className={styles.footerLinks}>
            <Link href="/Login" className={styles.link}>
              ← Back to Login
            </Link>
            {step === 2 && (
              <span onClick={() => { setStep(1); setMessage(null) }} className={styles.link}>
                Change email/number
              </span>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
