import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../context/auth'
//import { AuthWrapper } from '@/props/authWrapper' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gensights',
  description: 'Admin Dashboard',
  icons: {
    icon: '/gen.svg',   
    shortcut: '/gen.svg',     
    apple: '/gen.svg', 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}