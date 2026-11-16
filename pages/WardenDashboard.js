/**
 * pages/WardenDashboard.js — Warden Management Panel
 * -----------------------------------------------------
 * Accessible only to role === 'warden'.
 *
 * Powers:
 *   - View all students in managed hostel
 *   - View + resolve all issues
 *   - Approve / reject student leave requests
 *   - Post notices to students and parents
 */

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Navbar from '../components/Navbar'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/WardenDashboard.module.css'
import axios from 'axios'
import { Chip } from '@mui/material'

const ROLE_REDIRECT = {
  student:     '/StudentDashboard',
  parent:      '/ParentDashboard',
  masterAdmin: '/MasterDashboard',
}

export default function WardenDashboard() {
  const { status, data } = useSession()
  const { isDark } = useTheme()

  const [activeTab, setActiveTab]   = useState('overview')
  const [issues, setIssues]         = useState([])
  const [students, setStudents]     = useState([])
  const [leaveReqs, setLeaveReqs]   = useState([])
  const [loading, setLoading]       = useState(true)

  // ---- ROLE GUARD ----------------------------------------
  useEffect(() => {
    if (status === 'unauthenticated') return Router.push('/Login')
    if (status === 'authenticated') {
      const role = data?.user?.role
      if (role && role !== 'warden') Router.replace(ROLE_REDIRECT[role] || '/Login')
    }
  }, [status, data])

  useEffect(() => {
    if (status === 'authenticated' && data?.user?.role === 'warden') {
      Promise.all([fetchIssues(), fetchStudents(), fetchLeaveRequests()])
        .finally(() => setLoading(false))
    }
  }, [status])

  async function fetchIssues() {
    try { const r = await axios.get('/api/admin/issues'); setIssues(r.data || []) } catch { setIssues([]) }
  }
  async function fetchStudents() {
    try { const r = await axios.get('/api/admin/students'); setStudents(r.data || []) } catch { setStudents([]) }
  }
  async function fetchLeaveRequests() {
    try { const r = await axios.get('/api/admin/leave'); setLeaveReqs(r.data || []) } catch { setLeaveReqs([]) }
  }

  async function updateIssueStatus(id, status) {
    try {
      await axios.patch(`/api/admin/issues/${id}`, { status })
      fetchIssues()
    } catch (err) { console.error(err) }
  }

  async function handleLeave(id, action) {
    try {
      await axios.patch(`/api/admin/leave/${id}`, { status: action })
      fetchLeaveRequests()
    } catch (err) { console.error(err) }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
        <Navbar role="warden" />
        <div className={styles.loader}><span className={styles.spin} />Loading warden console…</div>
      </div>
    )
  }

  if (status !== 'authenticated' || data?.user?.role !== 'warden') return null

  const pendingIssues   = issues.filter(i => i.status === 'pending').length
  const pendingLeave    = leaveReqs.filter(l => l.status === 'pending').length

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <Head><title>Warden Dashboard — HMS</title></Head>

      <Navbar email={data.user.email} role="warden" logOut="true" />

      <main className={styles.main}>

        {/* ---- HEADER ------------------------------------ */}
        <div className={styles.header}>
          <h1 className={styles.title}>🔑 Warden Dashboard</h1>
          <p className={styles.subtitle}>Managing: <strong>{data.user.managedHostel || 'All Hostels'}</strong></p>
        </div>

        {/* ---- QUICK STATS ------------------------------- */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Students', value: students.length, icon: '🎓' },
            { label: 'Open Issues',    value: pendingIssues,   icon: '📋' },
            { label: 'Pending Leave',  value: pendingLeave,    icon: '🏠' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statNum}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ---- TABS -------------------------------------- */}
        <div className={styles.tabs}>
          {['issues', 'leave', 'students', 'notices'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {{ issues:'📋 Issues', leave:'🏠 Leave Requests', students:'👥 Students', notices:'📢 Notices' }[tab]}
              {tab === 'issues' && pendingIssues > 0 && (
                <span className={styles.badge}>{pendingIssues}</span>
              )}
              {tab === 'leave' && pendingLeave > 0 && (
                <span className={styles.badge}>{pendingLeave}</span>
              )}
            </button>
          ))}
        </div>

        {/* ---- ISSUES TAB -------------------------------- */}
        {activeTab === 'issues' && (
          <div className={styles.section}>
            {issues.length === 0
              ? <div className={styles.empty}>📭 No issues submitted.</div>
              : issues.map(issue => (
                <div key={issue._id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <strong>{issue.title}</strong>
                    <p className={styles.muted}>{issue.description}</p>
                    <p className={styles.meta}>By: {issue.userId?.name || 'Unknown'}</p>
                  </div>
                  <div className={styles.cardRight}>
                    <Chip label={issue.status} color={issue.status === 'pending' ? 'warning' : 'success'} size="small" />
                    {issue.status === 'pending' && (
                      <button className={styles.resolveBtn} onClick={() => updateIssueStatus(issue._id, 'resolved')}>
                        ✓ Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ---- LEAVE REQUESTS TAB ----------------------- */}
        {activeTab === 'leave' && (
          <div className={styles.section}>
            {leaveReqs.length === 0
              ? <div className={styles.empty}>📭 No leave requests.</div>
              : leaveReqs.map(req => (
                <div key={req._id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <strong>{req.studentId?.name || 'Student'}</strong>
                    <p className={styles.muted}>📍 {req.destination} — {req.reason}</p>
                    <p className={styles.meta}>
                      {new Date(req.fromDate).toLocaleDateString()} → {new Date(req.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.cardRight}>
                    <Chip label={req.status} color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'} size="small" />
                    {req.status === 'pending' && (
                      <div className={styles.actionBtns}>
                        <button className={styles.approveBtn} onClick={() => handleLeave(req._id, 'approved')}>✓ Approve</button>
                        <button className={styles.rejectBtn}  onClick={() => handleLeave(req._id, 'rejected')}>✕ Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ---- STUDENTS TAB ------------------------------ */}
        {activeTab === 'students' && (
          <div className={styles.section}>
            {students.length === 0
              ? <div className={styles.empty}>No students found.</div>
              : (
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <span>Name</span><span>Roll No.</span><span>Room</span><span>Contact</span>
                  </div>
                  {students.map(s => (
                    <div key={s._id} className={styles.tableRow}>
                      <span>{s.name}</span>
                      <span className={styles.muted}>#{s.rollNumber}</span>
                      <span>{s.roomNumber}</span>
                      <span className={styles.muted}>{s.contact}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ---- NOTICES TAB ------------------------------ */}
        {activeTab === 'notices' && (
          <div className={styles.section}>
            <p className={styles.muted}>Notice board — Phase 2 feature.</p>
            <div className={styles.comingSoon}>🚧 Under Construction</div>
          </div>
        )}

      </main>
    </div>
  )
}
