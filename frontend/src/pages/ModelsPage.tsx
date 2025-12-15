import React, { useState, useEffect } from 'react'
import ModelViewer from '../components/ModelViewer'
import { getModels } from '../services/api'
import type { Model3D } from '../types'

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadModels()
  }, [selectedCategory])

  const loadModels = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getModels(
        selectedCategory !== 'all' ? selectedCategory : undefined
      )
      setModels(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error loading models')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'mechanical', 'architectural', 'organic', 'other']

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Model Library
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse all indexed 3D models
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-gray-700 dark:text-gray-300 font-medium">
          Category:
        </label>
        <div className="flex space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading models...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Models Grid */}
      {!loading && !error && (
        <>
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            {models.length} model{models.length !== 1 ? 's' : ''} found
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-700">
                  <ModelViewer />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {model.name}
                  </h3>
                  
                  {model.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {model.description}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex justify-between">
                      <span>Vertices:</span>
                      <span className="font-medium">{model.vertex_count?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faces:</span>
                      <span className="font-medium">{model.face_count?.toLocaleString()}</span>
                    </div>
                    {model.volume && (
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium">{model.volume.toFixed(3)}</span>
                      </div>
                    )}
                  </div>

                  {model.category && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                        {model.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {models.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No models found in this category
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ModelsPage
