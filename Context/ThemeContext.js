/**
 * Context/ThemeContext.js — Global Dark/Light Mode Context
 * ----------------------------------------------------------
 * Provides `isDark` state and `toggleTheme` function to every
 * component in the app via React Context.
 *
 * Usage in any component:
 *   import { useTheme } from '../Context/ThemeContext'
 *   const { isDark, toggleTheme } = useTheme()
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

// Create the context with default values
const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => {},
})

// ThemeProvider wraps the entire app (added in _app.js)
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false)

    // On first load: restore saved theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('hms-theme')
        if (saved === 'dark') setIsDark(true)
    }, [])

    // When isDark changes: update body class + save to localStorage
    useEffect(() => {
        document.body.classList.remove('light-bg', 'dark-bg')
        document.body.classList.add(isDark ? 'dark-bg' : 'light-bg')
        localStorage.setItem('hms-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// Custom hook — shortcut for useContext(ThemeContext)
export function useTheme() {
    return useContext(ThemeContext)
}
