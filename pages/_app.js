import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../Context/ThemeContext'

/**
 * _app.js — Global App Wrapper
 * ------------------------------
 * Every page in Next.js is wrapped by this component.
 * We wrap with:
 *   - SessionProvider: makes NextAuth session available everywhere
 *   - ThemeProvider:   makes isDark/toggleTheme available everywhere
 */
function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
}

export default MyApp
