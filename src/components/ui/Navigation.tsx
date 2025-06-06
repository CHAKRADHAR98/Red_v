'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full">
          
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Wallet Explorer
              </Link>
              <Link
                href="/enhanced"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/enhanced') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Enhanced Explorer
              </Link>
              <Link
                href="/visualize"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/visualize') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Visualization
              </Link>
              <Link
  href="/bubblemaps"
  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
    pathname === '/bubblemaps' 
      ? 'border-blue-500 text-gray-900 dark:text-white'
      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
  }`}
>
  Bubblemaps
</Link>
              <Link
                href="/tokens"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/tokens') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Token Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block py-2 pl-3 pr-4 text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Wallet Explorer
          </Link>
          <Link
            href="/enhanced"
            className={`block py-2 pl-3 pr-4 text-base font-medium ${
              isActive('/enhanced') 
                ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Enhanced Explorer
          </Link>
          <Link
            href="/visualize"
            className={`block py-2 pl-3 pr-4 text-base font-medium ${
              isActive('/visualize') 
                ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Visualization
          </Link>
          <Link
  href="/bubblemaps"
  className={`block py-2 pl-3 pr-4 text-base font-medium ${
    pathname === '/bubblemaps' 
      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-400'
      : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white'
  }`}
>
  Bubblemaps
</Link>
          <Link
            href="/tokens"
            className={`block py-2 pl-3 pr-4 text-base font-medium ${
              isActive('/tokens') 
                ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Token Explorer
          </Link>
        </div>
      </div>
    </nav>
  );
}