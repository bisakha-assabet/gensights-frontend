import { useAuth } from '@/context/auth'
import Link from 'next/link'

export default function Header() {
  const { user, logout } = useAuth()
  
  console.log("Header component - user data:", user)

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Gensights
          </Link>
          
          {user && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href={`/organizations/${user.organization_id}`} className="text-gray-500 hover:text-gray-700">
                Organization
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}