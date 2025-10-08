'use client';
import { useAuth } from '../../context/auth';
//import Image from 'next/image';

export default function UserProfile() {
  const { user } = useAuth();

  console.log("UserProfile component - user data:", user);
  
  if(!user) return null


  const fullName = `${user?.first_name} ${user?.last_name}`;
  const initials = `${user?.first_name.charAt(0)}${user?.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-black dark:text-white">
      {/* User Info */}
      <div className="text-right">
        <div className="text-sm font-medium">
          {fullName}
        </div>
        <div className="text-xs">
          {user?.email}
        </div>
      </div>
      
      {/* Profile Picture */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {initials}
            </span>
          </div>
        </div>
        
        {/* Online Status Indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
}