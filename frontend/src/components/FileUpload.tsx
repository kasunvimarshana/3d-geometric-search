import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileSelected: (file: File) => void
  acceptedFormats?: string[]
  maxSize?: number
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  acceptedFormats = ['.stl', '.obj', '.step', '.stp', '.ply', '.iges', '.igs'],
  maxSize = 100 * 1024 * 1024 // 100MB
}) => {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`)
      } else {
        setError('Invalid file type')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0])
    }
  }, [onFileSelected, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => {
      acc[`model/${format.slice(1)}`] = [format]
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <div className="mt-4">
          {isDragActive ? (
            <p className="text-lg text-primary-600 dark:text-primary-400">
              Drop the file here...
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Drag and drop your 3D model here, or click to browse
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Supported formats: {acceptedFormats.join(', ')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size: {maxSize / 1024 / 1024}MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

export default FileUpload
