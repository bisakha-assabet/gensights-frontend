import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SideNav from '@/components/layout/SideNav'
import UserProfile from '@/components/layout/UserProfile'
import { DarkModeProvider } from '@/context/DarkModeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gensights',
  description: 'Admin Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DarkModeProvider>
      <div className={inter.className}>
        <div className="flex h-screen bg-gray-50 dark:bg-[#121212] overflow-hidden">
          <div className="h-full">
            <SideNav />
          </div>
          <div className="flex-1 flex flex-col h-full">
            <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-700 px-6 py-1 flex justify-end text-black h-[65px]">
              <UserProfile />
            </header>
            <main className="flex-1 overflow-auto px-2 bg-white dark:bg-[#1E1E1E]">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DarkModeProvider>
  )
}
