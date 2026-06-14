'use client'

import Image from 'next/image'
import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react'
import ProfileAvatar from './ProfileAvatar'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const CROP_SIZE = 320
const OUTPUT_SIZE = 400
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type Point = { x: number; y: number }
type ImageSize = { width: number; height: number }

type ProfilePhotoManagerProps = {
  displayName: string
  initialImageUrl: string | null
  onUploadSuccess?: (imageUrl: string | null) => void
}

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { failed: boolean }

class ProfilePhotoErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Profile photo manager failed:', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
          Profile photo tools could not be loaded. Refresh the page and try again.
        </div>
      )
    }

    return this.props.children
  }
}

function loadImageSize(source: string) {
  return new Promise<ImageSize>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('The selected image could not be loaded.'))
    image.src = source
  })
}

function clampOffset(offset: Point, imageSize: ImageSize, zoom: number) {
  const baseScale = Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height)
  const renderedWidth = imageSize.width * baseScale * zoom
  const renderedHeight = imageSize.height * baseScale * zoom
  const maxX = Math.max(0, (renderedWidth - CROP_SIZE) / 2)
  const maxY = Math.max(0, (renderedHeight - CROP_SIZE) / 2)

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  }
}

async function createCroppedWebp(source: string, imageSize: ImageSize, zoom: number, offset: Point) {
  const image = new window.Image()
  image.src = source
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const context = canvas.getContext('2d', { alpha: false })

  if (!context) {
    throw new Error('Image processing is not supported in this browser.')
  }

  const baseScale = Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height)
  const renderScale = baseScale * zoom
  const outputRatio = OUTPUT_SIZE / CROP_SIZE
  const renderedWidth = imageSize.width * renderScale * outputRatio
  const renderedHeight = imageSize.height * renderScale * outputRatio
  const x = (CROP_SIZE / 2 + offset.x) * outputRatio - renderedWidth / 2
  const y = (CROP_SIZE / 2 + offset.y) * outputRatio - renderedHeight / 2

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, x, y, renderedWidth, renderedHeight)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
  if (!blob) {
    throw new Error('The cropped image could not be created.')
  }

  return blob
}

function ProfilePhotoManagerContent({
  displayName,
  initialImageUrl,
  onUploadSuccess,
}: ProfilePhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragOrigin = useRef<{ pointer: Point; offset: Point } | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl)
  const [source, setSource] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<ImageSize | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (source?.startsWith('blob:')) URL.revokeObjectURL(source)
    }
  }, [source])

  async function selectFile(file: File | undefined) {
    setError('')
    if (!file) return
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Image must be 5MB or smaller.')
      return
    }

    const nextSource = URL.createObjectURL(file)
    try {
      const size = await loadImageSize(nextSource)
      setSource(nextSource)
      setImageSize(size)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    } catch (selectionError) {
      URL.revokeObjectURL(nextSource)
      setError(selectionError instanceof Error ? selectionError.message : 'Unable to read this image.')
    }
  }

  function changeZoom(nextZoom: number) {
    const normalizedZoom = Math.min(3, Math.max(1, nextZoom))
    setZoom(normalizedZoom)
    if (imageSize) setOffset((value) => clampOffset(value, imageSize, normalizedZoom))
  }

  async function uploadCroppedImage() {
    if (!source || !imageSize) return
    setIsUploading(true)
    setError('')

    try {
      const blob = await createCroppedWebp(source, imageSize, zoom, offset)
      const formData = new FormData()
      formData.append('image', new File([blob], 'profile.webp', { type: 'image/webp' }))
      const response = await fetch('/api/account/profile-image', { method: 'POST', body: formData })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed.')
      }

      setCurrentImageUrl(result.data.imageUrl)
      setSource(null)
      setImageSize(null)
      onUploadSuccess?.(result.data.imageUrl)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload profile image.')
    } finally {
      setIsUploading(false)
    }
  }

  async function removePhoto() {
    setIsUploading(true)
    setError('')
    try {
      const response = await fetch('/api/account/profile-image', { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to remove profile photo.')
      setCurrentImageUrl(null)
      onUploadSuccess?.(null)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove profile photo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative mx-auto rounded-full sm:mx-0"
          aria-label="Change profile photo"
        >
          <ProfileAvatar imageUrl={currentImageUrl} name={displayName} className="h-28 w-28 text-4xl shadow-lg ring-4 ring-white dark:ring-slate-900" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/55 group-hover:opacity-100">
            <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5Z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">Profile photo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Upload a clear image. It will be cropped and compressed to 400x400 WebP.</p>
          <div
            onDragEnter={(event) => { event.preventDefault(); setIsDraggingFile(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDraggingFile(false)
              void selectFile(event.dataTransfer.files[0])
            }}
            className={`mt-4 rounded-xl border-2 border-dashed px-5 py-4 text-center transition ${
              isDraggingFile
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/20'
                : 'border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900'
            }`}
          >
            <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-bold text-teal-700 dark:text-teal-300">
              Choose an image
            </button>
            <span className="text-sm"> or drag and drop</span>
            <p className="mt-1 text-xs">JPEG, PNG, or WebP. Maximum 5MB.</p>
          </div>
          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void selectFile(event.target.files?.[0])}
          />
          {currentImageUrl && (
            <button type="button" onClick={() => void removePhoto()} disabled={isUploading} className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-60">
              Remove current photo
            </button>
          )}
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {source && imageSize && (
        <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="crop-title" className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="crop-title" className="text-xl font-bold">Crop profile photo</h2>
                <p className="mt-1 text-sm text-slate-500">Drag to reposition. Use the slider or mouse wheel to zoom.</p>
              </div>
              <button type="button" onClick={() => setSource(null)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xl dark:bg-slate-800" aria-label="Close cropper">x</button>
            </div>

            <div
              className="relative mx-auto mt-6 h-80 w-80 max-w-full touch-none cursor-grab overflow-hidden rounded-xl bg-slate-950 active:cursor-grabbing"
              onWheel={(event) => { event.preventDefault(); changeZoom(zoom - event.deltaY * 0.001) }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                dragOrigin.current = { pointer: { x: event.clientX, y: event.clientY }, offset }
              }}
              onPointerMove={(event) => {
                if (!dragOrigin.current) return
                const nextOffset = {
                  x: dragOrigin.current.offset.x + event.clientX - dragOrigin.current.pointer.x,
                  y: dragOrigin.current.offset.y + event.clientY - dragOrigin.current.pointer.y,
                }
                setOffset(clampOffset(nextOffset, imageSize, zoom))
              }}
              onPointerUp={() => { dragOrigin.current = null }}
              onPointerCancel={() => { dragOrigin.current = null }}
            >
              <Image
                src={source}
                alt="Crop preview"
                width={imageSize.width}
                height={imageSize.height}
                unoptimized
                draggable={false}
                sizes="320px"
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: `${imageSize.width * Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height) * zoom}px`,
                  height: `${imageSize.height * Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height) * zoom}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-[999px] ring-slate-950/65" />
              <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/90" />
            </div>

            <label className="mt-6 block">
              <span className="mb-2 flex justify-between text-sm font-semibold"><span>Zoom</span><span>{zoom.toFixed(1)}x</span></span>
              <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => changeZoom(Number(event.target.value))} className="w-full accent-teal-600" />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setSource(null)} disabled={isUploading} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={() => void uploadCroppedImage()} disabled={isUploading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {isUploading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {isUploading ? 'Uploading...' : 'Save profile photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function ProfilePhotoManager(props: ProfilePhotoManagerProps) {
  return (
    <ProfilePhotoErrorBoundary>
      <ProfilePhotoManagerContent {...props} />
    </ProfilePhotoErrorBoundary>
  )
}
