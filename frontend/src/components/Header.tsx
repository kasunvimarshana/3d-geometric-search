import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              3D GeoSearch
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Open Source
            </span>
          </Link>
          
          <div className="flex space-x-6">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
            >
              Search
            </Link>
            <Link
              to="/models"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
            >
              Models
            </Link>
            <Link
              to="/upload"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
