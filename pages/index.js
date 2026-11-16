import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      <Head>
        <title>Hostel Management System</title>
      </Head>
      <Navbar />

      {/* Main content area takes all remaining space */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'serif' }}>
          Welcome to the
        </h2>
        <h1 style={{ color: '#ef4444', fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem', fontFamily: 'serif' }}>
          IBS Boarding.
        </h1>
        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
          please login/signup to continue
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Link href="/Login" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              color="error"
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                padding: '8px 24px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              LOGIN
            </Button>
          </Link>

          <Link href="/Signup" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              color="error"
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                padding: '8px 24px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              SIGN UP
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer sticks naturally at the bottom */}
      <Footer />
    </div>
  )
}

