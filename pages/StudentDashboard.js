/**
 * StudentDashboard.js — Student Portal Main Page
 * -------------------------------------------------
 * Protected page — redirects to /Login if not authenticated.
 *
 * Shows:
 *   - Welcome greeting with student name
 *   - Profile card (name, hostel, room)
 *   - Issues/complaints table (from MongoDB)
 *   - Quick stats cards (total issues, pending, resolved)
 *   - Add Issue button
 *
 * Data is fetched from /api/login (user profile) and
 * /api/issue (student's submitted complaints).
 */

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Navbar from '../components/Navbar'
import Head from 'next/head'
import axios from 'axios'
import Link from 'next/link'
import { Button, Avatar, Chip } from '@mui/material'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/StudentDashboard.module.css'

const StudentDashboard = () => {
  const { status, data } = useSession()
  const { isDark } = useTheme()

  // User profile from MongoDB (name, hostel, room, etc.)
  const [userInfo, setUserInfo] = useState(null)

  // List of issues submitted by this student
  const [issueInfo, setIssueInfo] = useState(null)

  // Loading state while fetching data
  const [loading, setLoading] = useState(true)

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/Login')
    }
  }, [status])

  // Fetch user profile from local API once session is ready
  useEffect(() => {
    if (status === 'authenticated' && data?.user?.email) {
      fetchUserProfile()
    }
  }, [status, data])

  // Fetch issues once userInfo is available
  useEffect(() => {
    if (userInfo?._id) {
      fetchIssues()
    }
  }, [userInfo])

  async function fetchUserProfile() {
    try {
      const res = await axios.get('/api/user/profile')
      if (res.data?.user) {
        setUserInfo(res.data.user)
      } else {
        // Fallback with email
        const fallback = await axios.post('/api/user/profile', { email: data.user.email })
        if (fallback.data?.user) setUserInfo(fallback.data.user)
      }
    } catch (err) {
      console.error('Profile fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchIssues() {
    try {
      const res = await axios.get(`/api/issue?userId=${userInfo._id}`)
      setIssueInfo(res.data)
    } catch (err) {
      console.error('Issues fetch error:', err.message)
      setIssueInfo([])
    }
  }

  // Compute quick stats from issues array
  const totalIssues = issueInfo?.length ?? 0
  const pendingIssues = issueInfo?.filter(i => i.status === 'pending').length ?? 0
  const resolvedIssues = issueInfo?.filter(i => i.status === 'resolved').length ?? 0

  // Priority colour mapping for chips
  const priorityColor = { high: 'error', medium: 'warning', low: 'default' }
  const statusColor = { pending: 'warning', resolved: 'success' }

  if (status === 'loading' || loading) {
    return (
      <div className={`${styles.loadingPage} ${isDark ? styles.dark : ''}`}>
        <Navbar />
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    const isGuest = !userInfo

    return (
      <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
        <Head>
          <title>{data.user.name}&apos;s Dashboard — HMS</title>
        </Head>

        <Navbar email={data.user.email} logOut="true" />

        <main className={styles.main}>

          {/* ---- WELCOME HEADER ------------------------------ */}
          <div className={styles.welcomeHeader}>
            <div>
              <h1 className={styles.greeting}>
                👋 Hola, <span className={styles.name}>{data.user.name?.toLowerCase()}</span>
              </h1>
              <p className={styles.subGreeting}>
                {new Date().getHours() < 12 ? 'Good morning!' : new Date().getHours() < 17 ? 'Good afternoon!' : 'Good evening!'} Here&apos;s your hostel overview.
              </p>
            </div>
            {userInfo && (
              <Link href={{ pathname: '/CreateIssue', query: { data: JSON.stringify(userInfo._id) } }}>
                <Button variant="contained" color="success" size="large">
                  + Add Issue
                </Button>
              </Link>
            )}
          </div>

          {/* ---- GUEST NOTICE -------------------------------- */}
          {isGuest && (
            <div className={styles.guestBanner}>
              <p>👤 You&apos;re browsing as a <strong>guest</strong>. Create a real account to track hostel issues and your profile.</p>
              <Link href="/Signup">
                <Button variant="outlined" size="small" style={{ marginTop: '8px' }}>
                  Create Account →
                </Button>
              </Link>
            </div>
          )}

          {/* ---- STAT CARDS (shown only for real users) ------ */}
          {userInfo && (
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statTotal}`}>
                <span className={styles.statNum}>{totalIssues}</span>
                <span className={styles.statLabel}>Total Issues</span>
              </div>
              <div className={`${styles.statCard} ${styles.statPending}`}>
                <span className={styles.statNum}>{pendingIssues}</span>
                <span className={styles.statLabel}>Pending</span>
              </div>
              <div className={`${styles.statCard} ${styles.statResolved}`}>
                <span className={styles.statNum}>{resolvedIssues}</span>
                <span className={styles.statLabel}>Resolved</span>
              </div>
            </div>
          )}

          <div className={styles.contentGrid}>

            {/* ---- PROFILE CARD ------------------------------ */}
            {userInfo && (
              <div className={styles.profileCard}>
                <h3 className={styles.cardTitle}>Your Profile</h3>
                <div className={styles.profileInner}>
                  <Avatar
                    sx={{ width: 64, height: 64, fontSize: '1.8rem', bgcolor: isDark ? '#2c5f8a' : '#d4956a' }}
                  >
                    {userInfo.name?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <div className={styles.profileDetails}>
                    <p><span className={styles.profileLabel}>Name</span>{userInfo.name}</p>
                    <p><span className={styles.profileLabel}>Email</span>{userInfo.email}</p>
                    <p><span className={styles.profileLabel}>Hostel</span>{userInfo.hostelName}</p>
                    <p><span className={styles.profileLabel}>Room</span>{userInfo.roomNumber}</p>
                    <p><span className={styles.profileLabel}>Contact</span>{userInfo.contact}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ---- ISSUES TABLE ------------------------------ */}
            <div className={styles.issuesCard}>
              <h3 className={styles.cardTitle}>Your Complaints</h3>

              {/* Loading */}
              {!issueInfo && userInfo && (
                <p className={styles.muted}>Loading issues…</p>
              )}

              {/* Guest placeholder */}
              {isGuest && (
                <div className={styles.emptyState}>
                  <p className={styles.muted}>Sign up to start tracking hostel complaints.</p>
                </div>
              )}

              {/* Empty state */}
              {issueInfo && issueInfo.length === 0 && (
                <div className={styles.emptyState}>
                  <p style={{ fontSize: '2rem' }}>📋</p>
                  <p className={styles.muted}>No issues submitted yet.</p>
                  {userInfo && (
                    <Link href={{ pathname: '/CreateIssue', query: { data: JSON.stringify(userInfo._id) } }}>
                      <Button variant="outlined" color="success" size="small">
                        Submit your first issue →
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Issues list */}
              {issueInfo && issueInfo.length > 0 && (
                <div className={styles.issuesList}>
                  {issueInfo.map((issue) => (
                    <div key={issue._id} className={styles.issueRow}>
                      <div className={styles.issueMain}>
                        <strong className={styles.issueTitle}>{issue.title}</strong>
                        <p className={styles.issueDesc}>{issue.description}</p>
                      </div>
                      <div className={styles.issueChips}>
                        <Chip
                          label={issue.status}
                          color={statusColor[issue.status] || 'default'}
                          size="small"
                        />
                        <Chip
                          label={issue.priority}
                          color={priorityColor[issue.priority] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    )
  }

  return null
}

export default StudentDashboard