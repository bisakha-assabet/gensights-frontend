import Image from 'next/image'
import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Logo */}
      <header className="p-6">
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Gensights Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto">
          {/* Error Message */}
          <p className="text-gray-600 text-sm font-medium mb-4 tracking-wide">
            WE CAN'T FIND THIS PAGE
          </p>
          
          {/* Error Image */}
          <div className="mb-6">
            <Image
              src="/error.svg"
              alt="404 Error Illustration"
              width={400}
              height={200}
              className="w-full max-w-sm mx-auto"
              priority
            />
          </div>
          
          {/* Page Lost Message */}
          <h1 className="text-gray-800 text-lg font-semibold mb-6">
            PAGE LOST
          </h1>
          
          {/* Go Back Home Button */}
          <Link 
            href="/dashboard"
            className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium tracking-wide transition-colors duration-200 underline decoration-1 underline-offset-2"
          >
            GO BACK HOME
          </Link>
        </div>
      </main>
    </div>
  )
}