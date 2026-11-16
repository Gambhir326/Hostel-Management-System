/**
 * IssueDisplay.js — Student Dashboard Content Component
 * -------------------------------------------------------
 * Renders two sections on the StudentDashboard:
 *   1. "your enquiries" — a table of issues the student has submitted
 *   2. "your profile"  — the student's name, hostel, and room number
 *
 * Props:
 *   - email    : logged-in user's email (from NextAuth session)
 *   - password : logged-in user's password (used to fetch user from DB)
 *
 * Data flow:
 *   1. On mount → getUserDetails() fetches user from /api/login (local API)
 *   2. Once userInfo is set → getIssueDetails() fetches issues by user ID
 *      from /api/issue (local API)
 */

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Avatar, Button } from '@mui/material'
import styles from './IssueDisplay.module.css'
import Image from 'next/image'
import Link from 'next/link'
import Warning from '/assets/warning.svg'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const IssueDisplay = ({ email, password }) => {

    // userInfo — the full student document fetched from MongoDB
    const [userInfo, setUserInfo] = useState(null)

    // issueInfo — array of issues submitted by this student
    const [issueInfo, setIssueInfo] = useState(null)

    // loading — true while fetching user data, prevents premature renders
    const [loading, setLoading] = useState(true)

    // ---- FETCH USER DETAILS --------------------------------
    // Calls the local /api/login route to get the user document
    // from MongoDB using email + password.
    async function getUserDetails() {
        try {
            const res = await axios.post('/api/login', { email, password })
            if (res.data && res.data.user) {
                setUserInfo(res.data.user)
            }
        } catch (err) {
            console.error('Failed to fetch user details:', err.message)
        } finally {
            setLoading(false)
        }
    }

    // ---- FETCH ISSUE DETAILS --------------------------------
    // Calls the local /api/issue route to get all issues
    // belonging to this user (filtered by userId on the server).
    async function getIssueDetails() {
        try {
            const res = await axios.get(`/api/issue?userId=${userInfo._id}`)
            setIssueInfo(res.data)
        } catch (err) {
            console.error('Failed to fetch issues:', err.message)
            setIssueInfo([]) // show empty state instead of crashing
        }
    }

    // On mount: load the user's profile
    useEffect(() => {
        if (email) getUserDetails()
    }, [email]) // eslint-disable-line react-hooks/exhaustive-deps

    // After userInfo loads: fetch their issues
    useEffect(() => {
        if (userInfo) getIssueDetails()
    }, [userInfo]) // eslint-disable-line react-hooks/exhaustive-deps

    // ---- LOADING STATE ------------------------------------
    if (loading) {
        return <p style={{ color: 'gray', marginTop: '30px' }}>Loading your profile...</p>
    }

    // ---- NO USER FOUND ------------------------------------
    // Guest accounts won't have a DB record — show a friendly message
    if (!userInfo) {
        return (
            <div style={{ marginTop: '30px', color: 'gray' }}>
                <p>👋 You&apos;re logged in as a <strong>guest</strong>.</p>
                <p>Guest accounts don&apos;t have a profile or issues.</p>
                <Link href="/Signup">
                    <Button variant="outlined" color="primary">Create a real account</Button>
                </Link>
            </div>
        )
    }

    // ---- MAIN RENDER --------------------------------------
    return (
        <div>
            <div className={styles.issueDisplayContainer}>

                {/* ---- ISSUES TABLE SECTION ----------------------- */}
                <div>
                    <h3>your enquiries</h3>

                    {/* Table: shown only if issues have loaded */}
                    {issueInfo && issueInfo.length > 0 && (
                        <TableContainer component={Paper} sx={{ minWidth: 650, maxWidth: 800 }}>
                            <Table size="small" aria-label="issues table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'lightgray' }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Title</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black' }}>Description</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black' }}>Status</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black' }}>Priority</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {issueInfo.map((issue) => (
                                        <TableRow
                                            key={issue._id || issue.title}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">{issue.title}</TableCell>
                                            <TableCell align="center" sx={{ maxWidth: 200 }}>{issue.description}</TableCell>
                                            <TableCell align="center">{issue.status}</TableCell>
                                            <TableCell align="center">{issue.priority}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Empty state: user has no issues yet */}
                    {issueInfo && issueInfo.length === 0 && (
                        <center>
                            <Image src={Warning} width={40} height={40} alt="warning" />
                            <p style={{ color: 'gray' }}>you haven&apos;t added any issue yet</p>
                        </center>
                    )}

                    {/* Loading issues */}
                    {!issueInfo && <p style={{ color: 'gray' }}>Loading issues...</p>}

                    {/* Add Issue button — passes user ID to CreateIssue page */}
                    <Link href={{ pathname: '/CreateIssue', query: { data: JSON.stringify(userInfo._id) } }}>
                        <Button variant="outlined" color="success" style={{ marginTop: '50px' }}>
                            Add Issue
                        </Button>
                    </Link>
                </div>

                {/* ---- PROFILE CARD SECTION ----------------------- */}
                <div className={styles.profileContainer}>
                    <h3>your profile</h3>
                    <div className={styles.profileCard}>
                        {/*
                         * userInfo.name?.[0] uses optional chaining (?.)
                         * so it won't crash if name is undefined/empty.
                         * Falls back to '?' as the avatar letter.
                         */}
                        <Avatar>{userInfo.name?.[0]?.toUpperCase() || '?'}</Avatar>
                        <p>Name: {userInfo.name || '—'}</p>
                        <p>Hostel: {userInfo.hostelName || '—'}</p>
                        <p>Room Number: {userInfo.roomNumber || '—'}</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default IssueDisplay