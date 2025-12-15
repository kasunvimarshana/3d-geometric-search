import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import ModelViewer from '../components/ModelViewer'
import { searchByUpload } from '../services/api'
import type { SearchResponse, Model3D } from '../types'

const SearchPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleSearch = async () => {
    if (!selectedFile) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await searchByUpload(selectedFile)
      setResults(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error performing search')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          3D Geometric Search
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Upload a 3D model and find similar shapes from our database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upload Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Upload Model
          </h2>
          <FileUpload onFileSelected={handleFileSelected} />
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Preview
          </h2>
          <div className="h-96">
            <ModelViewer />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Search Results
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Found {results.total_results} similar models in{' '}
              {results.processing_time.toFixed(2)}s
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.results.map((result, index) => (
              <div
                key={result.model.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-700">
                  <ModelViewer />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {result.model.name}
                    </h3>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {(result.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  {result.model.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {result.model.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{result.model.vertex_count?.toLocaleString()} vertices</span>
                    {result.model.category && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {result.model.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
