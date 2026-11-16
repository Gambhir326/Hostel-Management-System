/**
 * pages/CreateIssue.js — Student Issue / Complaint Submission
 * -------------------------------------------------------------
 * Allows authenticated students to lodge a hostel complaint.
 * Saves to MongoDB via local POST /api/issue.
 */

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '../components/Navbar'
import Router, { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material'
import { useTheme } from '../Context/ThemeContext'
import axios from 'axios'

const CreateIssue = () => {
  const { status, data } = useSession()
  const { isDark } = useTheme()
  const router = useRouter()

  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('low')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/Login')
    }
  }, [status])

  useEffect(() => {
    // If passed via query param
    if (router.query.data) {
      try {
        const parsed = JSON.parse(router.query.data)
        setUserId(parsed)
      } catch {
        setUserId(router.query.data)
      }
    } else if (data?.user?.id) {
      setUserId(data.user.id)
    }
  }, [router.query, data])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const effectiveUserId = userId || data?.user?.id
    if (!effectiveUserId) {
      setErrorMsg('User identity could not be verified. Please return to dashboard and try again.')
      return
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide both a title and description for your issue.')
      return
    }

    setLoading(true)

    try {
      const res = await axios.post('/api/issue', {
        userId: effectiveUserId,
        title: title.trim(),
        description: description.trim(),
        priority: priority.toLowerCase(),
      })

      if (res.status === 200 || res.status === 201) {
        Router.push('/StudentDashboard')
      } else {
        setErrorMsg('Failed to submit issue. Please try again.')
      }
    } catch (err) {
      console.error('Submit issue error:', err)
      setErrorMsg(err.response?.data?.message || 'Server error occurred while submitting issue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', transition: 'background 0.4s ease, color 0.4s ease' }}>
      <Head>
        <title>Create Issue — HMS</title>
      </Head>
      <Navbar logOut="true" role={data?.user?.role || 'student'} />

      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{
          background: isDark ? 'rgba(13,27,42,0.85)' : 'rgba(255,255,255,0.85)',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: isDark ? '0 4px 20px rgba(0,60,120,0.3)' : '0 4px 20px rgba(180,130,70,0.12)',
          border: isDark ? '1px solid rgba(74,158,214,0.2)' : '1px solid rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            margin: '0 0 8px',
            color: isDark ? '#ffffff' : '#2d1a00',
            fontSize: '1.6rem',
            fontWeight: 800
          }}>
            Lodge a Hostel Complaint
          </h2>
          <p style={{ margin: '0 0 24px', color: isDark ? '#8ab8d8' : '#7a4a1e', fontSize: '0.9rem' }}>
            Fill in the details below. The warden and hostel authority will review your issue.
          </p>

          {errorMsg && (
            <div style={{
              background: 'rgba(211,47,47,0.1)',
              border: '1px solid #d32f2f',
              color: '#d32f2f',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Issue Title"
              variant="outlined"
              placeholder="e.g. Broken fan, Water leakage in washroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Description"
              variant="outlined"
              placeholder="Provide specific details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority Level</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priority Level"
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="low">🟢 Low (Routine maintenance)</MenuItem>
                <MenuItem value="medium">🟡 Medium (Requires attention soon)</MenuItem>
                <MenuItem value="high">🔴 High (Urgent / safety hazard)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="success"
              type="submit"
              size="large"
              disabled={loading}
              style={{ marginTop: '8px', padding: '12px', fontWeight: 700 }}
            >
              {loading ? 'Submitting…' : 'Submit Issue'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/StudentDashboard">
              <Button variant="text" color="inherit" size="small">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CreateIssue
