/**
 * pages/MasterDashboard.js — Master Admin Root Panel
 * -----------------------------------------------------
 * Only accessible to users with role === 'masterAdmin'.
 * Redirect all other roles to their own dashboard.
 *
 * Powers:
 *   - View all accounts (students, parents, wardens)
 *   - Create warden accounts
 *   - Suspend / delete warden accounts
 *   - System-wide statistics
 *   - Manage hostels
 */

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Navbar from '../components/Navbar'
import { useTheme } from '../Context/ThemeContext'
import styles from '../styles/MasterDashboard.module.css'
import axios from 'axios'

const ROLE_REDIRECT = {
  student: '/StudentDashboard',
  parent:  '/ParentDashboard',
  warden:  '/WardenDashboard',
}

export default function MasterDashboard() {
  const { status, data } = useSession()
  const { isDark } = useTheme()

  const [stats, setStats]       = useState(null)
  const [wardens, setWardens]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // ---- ROLE GUARD ----------------------------------------
  useEffect(() => {
    if (status === 'unauthenticated') return Router.push('/Login')
    if (status === 'authenticated') {
      const role = data?.user?.role
      if (role && role !== 'masterAdmin') {
        Router.replace(ROLE_REDIRECT[role] || '/Login')
      }
    }
  }, [status, data])

  useEffect(() => {
    if (status === 'authenticated' && data?.user?.role === 'masterAdmin') {
      fetchStats()
      fetchWardens()
    }
  }, [status])

  async function fetchStats() {
    try {
      const res = await axios.get('/api/admin/stats')
      setStats(res.data)
    } catch { setStats({ students: '—', parents: '—', wardens: '—', issues: '—' }) }
    finally { setLoading(false) }
  }

  async function fetchWardens() {
    try {
      const res = await axios.get('/api/admin/wardens')
      setWardens(res.data || [])
    } catch { setWardens([]) }
  }

  async function deleteWarden(id) {
    if (!window.confirm('Are you sure you want to remove this warden account?')) return
    try {
      await axios.delete(`/api/admin/wardens?id=${id}`)
      fetchWardens()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove warden')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
        <Navbar role="masterAdmin" />
        <div className={styles.loader}><span className={styles.spin} />Loading master console…</div>
      </div>
    )
  }

  if (status !== 'authenticated' || data?.user?.role !== 'masterAdmin') return null

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <Head><title>Master Admin — HMS</title></Head>

      <Navbar email={data.user.email} role="masterAdmin" logOut="true" />

      <main className={styles.main}>

        {/* ---- HEADER ------------------------------------ */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>👑 Master Admin Console</h1>
            <p className={styles.subtitle}>Root authority — full system control</p>
          </div>
        </div>

        {/* ---- TABS -------------------------------------- */}
        <div className={styles.tabs}>
          {['overview', 'wardens', 'students', 'system'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {{ overview:'📊 Overview', wardens:'🔑 Wardens', students:'👥 Students', system:'⚙️ System' }[tab]}
            </button>
          ))}
        </div>

        {/* ---- OVERVIEW TAB ------------------------------ */}
        {activeTab === 'overview' && (
          <div>
            <div className={styles.statsGrid}>
              {[
                { label: 'Total Students', value: stats?.students, icon: '🎓' },
                { label: 'Total Parents', value: stats?.parents, icon: '👨‍👩‍👧' },
                { label: 'Active Wardens', value: stats?.wardens, icon: '🔑' },
                { label: 'Open Issues', value: stats?.openIssues, icon: '📋' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <span className={styles.statNum}>{s.value ?? '—'}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- WARDENS TAB ------------------------------- */}
        {activeTab === 'wardens' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Warden Accounts</h2>
              <button
                className={styles.primaryBtn}
                onClick={() => Router.push('/CreateWarden')}
              >
                + Create Warden
              </button>
            </div>

            {wardens.length === 0 ? (
              <div className={styles.empty}>
                <p>No wardens created yet.</p>
                <p className={styles.muted}>Create a warden to let them manage a hostel.</p>
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span>Name</span><span>Email</span><span>Hostel</span><span>Actions</span>
                </div>
                {wardens.map(w => (
                  <div key={w._id} className={styles.tableRow}>
                    <span>{w.name}</span>
                    <span className={styles.muted}>{w.email}</span>
                    <span>{w.managedHostel || '—'}</span>
                    <span>
                      <button className={styles.dangerBtn} onClick={() => deleteWarden(w._id)}>
                        Remove
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- STUDENTS TAB ------------------------------ */}
        {activeTab === 'students' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>All Students</h2>
            <p className={styles.muted}>Full student management coming in Phase 2.</p>
            <div className={styles.comingSoon}>🚧 Under Construction</div>
          </div>
        )}

        {/* ---- SYSTEM TAB -------------------------------- */}
        {activeTab === 'system' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>System Settings</h2>
            <p className={styles.muted}>Advanced system configuration — Phase 2.</p>
            <div className={styles.comingSoon}>🚧 Under Construction</div>
          </div>
        )}

      </main>
    </div>
  )
}
