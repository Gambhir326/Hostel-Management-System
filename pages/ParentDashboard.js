/**
 * pages/ParentDashboard.js — Parent View Panel
 * ---------------------------------------------
 * Accessible only to role === 'parent'.
 * Shows the linked child's profile and hostel issues.
 * Read-only — parents cannot submit or modify anything.
 */

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Navbar from '../components/Navbar'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/ParentDashboard.module.css'
import axios from 'axios'
import { Chip, Avatar } from '@mui/material'

const ROLE_REDIRECT = {
  student:     '/StudentDashboard',
  warden:      '/WardenDashboard',
  masterAdmin: '/MasterDashboard',
}

export default function ParentDashboard() {
  const { status, data } = useSession()
  const { isDark } = useTheme()

  const [child, setChild]       = useState(null)
  const [issues, setIssues]     = useState(null)
  const [notices, setNotices]   = useState([])
  const [loading, setLoading]   = useState(true)

  // ---- ROLE GUARD ----------------------------------------
  useEffect(() => {
    if (status === 'unauthenticated') return Router.push('/Login')
    if (status === 'authenticated') {
      const role = data?.user?.role
      if (role && role !== 'parent') Router.replace(ROLE_REDIRECT[role] || '/Login')
    }
  }, [status, data])

  useEffect(() => {
    if (status === 'authenticated' && data?.user?.role === 'parent') {
      fetchChildData()
    }
  }, [status])

  async function fetchChildData() {
    try {
      const res = await axios.get('/api/parent/child')
      setChild(res.data?.child || null)
      if (res.data?.child?._id) {
        const issueRes = await axios.get(`/api/parent/issues?childId=${res.data.child._id}`)
        setIssues(issueRes.data || [])
      }
    } catch (err) {
      console.error('Parent fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
        <Navbar role="parent" />
        <div className={styles.loader}><span className={styles.spin} />Loading…</div>
      </div>
    )
  }

  if (status !== 'authenticated' || data?.user?.role !== 'parent') return null

  const pendingIssues  = issues?.filter(i => i.status === 'pending').length ?? 0
  const resolvedIssues = issues?.filter(i => i.status === 'resolved').length ?? 0

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <Head><title>Parent Dashboard — HMS</title></Head>

      <Navbar email={data.user.email} role="parent" logOut="true" />

      <main className={styles.main}>

        {/* ---- HEADER ------------------------------------ */}
        <div className={styles.header}>
          <h1 className={styles.title}>👨‍👩‍👧 Parent Dashboard</h1>
          <p className={styles.subtitle}>Monitoring your child&apos;s hostel status</p>
        </div>

        {/* ---- NO CHILD LINKED --------------------------- */}
        {!child && (
          <div className={styles.alertCard}>
            <p>⚠️ No student linked to your account.</p>
            <p className={styles.muted}>
              Your account may not be linked yet. Please contact the warden or check the registration number you provided.
            </p>
          </div>
        )}

        {/* ---- CHILD PROFILE ----------------------------- */}
        {child && (
          <>
            {/* Stats row */}
            <div className={styles.statsRow}>
              {[
                { label: 'Total Issues', value: issues?.length ?? 0, icon: '📋' },
                { label: 'Pending',      value: pendingIssues,       icon: '⏳' },
                { label: 'Resolved',     value: resolvedIssues,      icon: '✅' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <span className={styles.statNum}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Content grid */}
            <div className={styles.grid}>

              {/* Child profile card */}
              <div className={styles.profileCard}>
                <h3 className={styles.cardTitle}>Your Child&apos;s Profile</h3>
                <div className={styles.profileInner}>
                  <Avatar sx={{ width: 72, height: 72, fontSize: '2rem', bgcolor: isDark ? '#1565c0' : '#1976d2' }}>
                    {child.name?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <div className={styles.details}>
                    {[
                      ['Name',    child.name],
                      ['Roll No', child.rollNumber],
                      ['Hostel',  child.hostelName],
                      ['Room',    child.roomNumber],
                      ['Contact', child.contact],
                    ].map(([label, value]) => (
                      <div key={label} className={styles.detailRow}>
                        <span className={styles.detailLabel}>{label}</span>
                        <span className={styles.detailValue}>{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues list */}
              <div className={styles.issuesCard}>
                <h3 className={styles.cardTitle}>Hostel Issues (Read-Only)</h3>
                {!issues && <p className={styles.muted}>Loading issues…</p>}
                {issues?.length === 0 && (
                  <div className={styles.empty}>📭 No issues submitted yet.</div>
                )}
                {issues && issues.length > 0 && (
                  <div className={styles.issueList}>
                    {issues.map(issue => (
                      <div key={issue._id} className={styles.issueRow}>
                        <div>
                          <strong className={styles.issueTitle}>{issue.title}</strong>
                          <p className={styles.muted}>{issue.description}</p>
                          <span className={styles.issueDate}>
                            {new Date(issue.date || issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.chips}>
                          <Chip label={issue.status}   color={issue.status === 'pending' ? 'warning' : 'success'} size="small" />
                          <Chip label={issue.priority} variant="outlined" size="small" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  )
}
