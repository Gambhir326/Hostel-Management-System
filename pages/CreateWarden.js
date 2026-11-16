/**
 * pages/CreateWarden.js — Master Admin: Create Warden Account
 * -------------------------------------------------------------
 * Accessible only to masterAdmin.
 * Allows creating warden accounts with specific managed hostel block assignments.
 */

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import { Button, TextField } from '@mui/material'
import { useTheme } from '../Context/ThemeContext'
import axios from 'axios'

export default function CreateWarden() {
  const { status, data } = useSession()
  const { isDark } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [contact, setContact] = useState('')
  const [managedHostel, setManagedHostel] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/Login')
    } else if (status === 'authenticated' && data?.user?.role !== 'masterAdmin') {
      Router.push('/Login')
    }
  }, [status, data])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await axios.post('/api/admin/wardens', {
        name,
        email,
        password,
        contact,
        managedHostel,
      })

      if (res.status === 201) {
        setIsSuccess(true)
        setMessage('Warden account created successfully!')
        setTimeout(() => {
          Router.push('/MasterDashboard')
        }, 1500)
      }
    } catch (err) {
      setIsSuccess(false)
      setMessage(err.response?.data?.message || 'Failed to create warden account.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', padding: '40px', textAlign: 'center' }}>Loading…</div>
  }

  if (data?.user?.role !== 'masterAdmin') return null

  return (
    <div style={{ minHeight: '100vh', transition: 'background 0.4s ease, color 0.4s ease' }}>
      <Head>
        <title>Create Warden — HMS Master Console</title>
      </Head>
      <Navbar email={data?.user?.email} role="masterAdmin" logOut="true" />

      <main style={{ maxWidth: '560px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{
          background: isDark ? 'rgba(13,27,42,0.9)' : 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '36px 30px',
          boxShadow: isDark ? '0 8px 32px rgba(0,60,120,0.3)' : '0 8px 32px rgba(180,130,70,0.12)',
          border: isDark ? '1px solid rgba(244,143,177,0.2)' : '1px solid rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            margin: '0 0 6px',
            color: isDark ? '#ffffff' : '#2d1a00',
            fontSize: '1.6rem',
            fontWeight: 800
          }}>
            🔑 Add New Warden
          </h2>
          <p style={{ margin: '0 0 24px', color: isDark ? '#f48fb1' : '#880e4f', fontSize: '0.9rem' }}>
            Wardens have administrative authority over their assigned hostel block.
          </p>

          {message && (
            <div style={{
              background: isSuccess ? 'rgba(46,125,50,0.12)' : 'rgba(211,47,47,0.1)',
              border: `1px solid ${isSuccess ? '#2e7d32' : '#d32f2f'}`,
              color: isSuccess ? '#2e7d32' : '#d32f2f',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              {isSuccess ? '✅ ' : '⚠️ '}{message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Warden Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Official Email Address"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Contact Phone Number"
              type="tel"
              variant="outlined"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Assigned Hostel Block"
              placeholder="e.g. Block A, Block B, or All Hostels"
              variant="outlined"
              value={managedHostel}
              onChange={(e) => setManagedHostel(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Temporary Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 8 characters. Will be encrypted using bcrypt."
              required
              fullWidth
            />

            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              style={{
                marginTop: '12px',
                padding: '12px',
                fontWeight: 700,
                backgroundColor: '#880e4f',
                color: '#fff'
              }}
            >
              {loading ? 'Creating Warden…' : 'Create Warden Account'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/MasterDashboard">
              <Button variant="text" color="inherit" size="small">
                ← Back to Master Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
