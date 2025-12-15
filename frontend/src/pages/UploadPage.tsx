import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import { uploadModel } from '../services/api'
import type { Model3D } from '../types'

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedModel, setUploadedModel] = useState<Model3D | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    // Auto-fill name from filename if empty
    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''))
    }
    setError(null)
    setUploadedModel(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !name) {
      setError('Please select a file and provide a name')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const model = await uploadModel(selectedFile, name, category, description)
      setUploadedModel(model)
      
      // Reset form
      setSelectedFile(null)
      setName('')
      setCategory('')
      setDescription('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error uploading model')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Model
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Add a new 3D model to the search database
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              3D Model File *
            </label>
            <FileUpload onFileSelected={handleFileSelected} />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Model Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter model name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="mechanical">Mechanical</option>
              <option value="architectural">Architectural</option>
              <option value="organic">Organic</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Optional description of the model"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !name}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isUploading ? 'Uploading...' : 'Upload and Index Model'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {uploadedModel && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-2">
              Model uploaded successfully!
            </h3>
            <p className="text-green-700 dark:text-green-400">
              <strong>{uploadedModel.name}</strong> has been indexed and is now searchable.
            </p>
            <div className="mt-2 text-sm text-green-600 dark:text-green-500">
              <p>Vertices: {uploadedModel.vertex_count?.toLocaleString()}</p>
              <p>Faces: {uploadedModel.face_count?.toLocaleString()}</p>
              {uploadedModel.volume && <p>Volume: {uploadedModel.volume.toFixed(3)}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
