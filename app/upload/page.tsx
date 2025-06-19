"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Upload, X, Camera, Check, AlertCircle } from "lucide-react"

interface PhotoUpload {
  id: string
  file: File
  preview: string
  title: string
  date: string
  location: string
  comment: string
  category: string
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error'
  cloudinaryUrl?: string
  errorMessage?: string
}

export default function UploadPage() {
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  // 드래그 앤 드롭 핸들러
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  // 파일 처리
  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto: PhotoUpload = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: e.target?.result as string,
          title: "",
          date: new Date().toISOString().split("T")[0],
          location: "",
          comment: "",
          category: "daily",
          uploadStatus: 'pending'
        }
        setPhotos((prev) => [...prev, newPhoto])
      }
      reader.readAsDataURL(file)
    })
  }

  // 사진 정보 업데이트
  const updatePhoto = (id: string, field: keyof PhotoUpload, value: string) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo)))
  }

  // 사진 제거
  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }

  // 개별 사진 업로드
  const uploadSinglePhoto = async (photo: PhotoUpload): Promise<void> => {
    setPhotos(prev => prev.map(p => 
      p.id === photo.id ? { ...p, uploadStatus: 'uploading' } : p
    ))

    try {
      const formData = new FormData()
      formData.append('file', photo.file)
      formData.append('title', photo.title)
      formData.append('date', photo.date)
      formData.append('location', photo.location)
      formData.append('comment', photo.comment)
      formData.append('category', photo.category)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? { 
            ...p, 
            uploadStatus: 'success',
            cloudinaryUrl: result.url 
          } : p
        ))

        // 메타데이터 저장
        await savePhotoMetadata({
          title: photo.title,
          date: photo.date,
          location: photo.location,
          comment: photo.comment,
          category: photo.category,
          url: result.url,
          publicId: result.public_id
        })

      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { 
          ...p, 
          uploadStatus: 'error',
          errorMessage: error.message 
        } : p
      ))
    }
  }

  // 메타데이터 저장
  const savePhotoMetadata = async (photoData: any) => {
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      })
      
      if (!response.ok) {
        console.warn('Failed to save photo metadata, but upload was successful')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error saving metadata:', error)
      // 메타데이터 저장 실패해도 이미지 업로드는 성공으로 처리
      return { success: false, error: error.message }
    }
  }

  // 전체 업로드 처리
  const handleUpload = async () => {
    if (photos.length === 0) return

    setUploading(true)

    // 모든 사진을 순차적으로 업로드
    for (const photo of photos) {
      if (photo.uploadStatus === 'pending') {
        await uploadSinglePhoto(photo)
      }
    }

    setUploading(false)
    
    // 모든 사진이 성공적으로 업로드되었는지 확인
    const allSuccess = photos.every(photo => photo.uploadStatus === 'success')
    if (allSuccess) {
      setUploadComplete(true)
      
      // 3초 후 갤러리로 리다이렉트
      setTimeout(() => {
        window.location.href = '/gallery'
      }, 2000)
    }
  }

  // 업로드 상태 아이콘
  const getStatusIcon = (status: PhotoUpload['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-romantic-gradient">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button asChild variant="ghost" className="text-romantic-text hover:text-romantic-pink-deep">
            <Link href="/gallery" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Gallery</span>
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-romantic-pink-deep animate-heart-beat" />
            <span className="font-serif text-xl text-romantic-text font-semibold">Add New Memories</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-romantic-text mb-4">Share Our New Adventures</h1>
          <p className="text-romantic-text/80 max-w-2xl mx-auto">
            Upload your favorite moments and add the stories behind them. Every photo deserves its beautiful memory.
          </p>
        </div>

        {/* Success Message */}
        {uploadComplete && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Photos uploaded successfully! Redirecting to gallery...</span>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <Card className="mb-8 border-2 border-dashed border-romantic-sky-light bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                dragActive
                  ? "border-romantic-sky-deep bg-romantic-sky-light/20"
                  : "border-romantic-sky-light hover:border-romantic-sky"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-romantic-sky-light rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-romantic-sky-deep" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-romantic-text mb-2">Drop your photos here</h3>
                  <p className="text-romantic-text/70 mb-4">or click to browse your device</p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild className="bg-romantic-sky-deep hover:bg-romantic-sky text-white rounded-full">
                    <label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose Photos</span>
                    </label>
                  </Button>
                </div>

                <p className="text-sm text-romantic-text/60">Supports JPG, PNG, GIF up to 10MB each</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo List */}
        {photos.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-serif text-romantic-text">Photos to Upload ({photos.length})</h2>

            {photos.map((photo) => (
              <Card key={photo.id} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Photo Preview */}
                    <div className="relative">
                      <Image
                        src={photo.preview || "/placeholder.svg"}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      
                      {/* Upload Status Indicator */}
                      <div className="absolute top-2 left-2 bg-white/90 rounded-full p-2">
                        {getStatusIcon(photo.uploadStatus)}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={photo.uploadStatus === 'uploading'}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Error Message */}
                      {photo.uploadStatus === 'error' && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-xs p-2 rounded">
                          {photo.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* Photo Details */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`title-${photo.id}`} className="text-romantic-text font-medium">
                            Photo Title *
                          </Label>
                          <Input
                            id={`title-${photo.id}`}
                            placeholder="e.g., Perfect Sunday Morning"
                            value={photo.title}
                            onChange={(e) => updatePhoto(photo.id, "title", e.target.value)}
                            className="mt-1"
                            disabled={photo.uploadStatus === 'uploading'}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor={`date-${photo.id}`} className="text-romantic-text font-medium">
                            Date
                          </Label>
                          <Input
                            id={`date-${photo.id}`}
                            type="date"
                            value={photo.date}
                            onChange={(e) => updatePhoto(photo.id, "date", e.target.value)}
                            className="mt-1"
                            disabled={photo.uploadStatus === 'uploading'}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`location-${photo.id}`} className="text-romantic-text font-medium">
                            Location
                          </Label>
                          <Input
                            id={`location-${photo.id}`}
                            placeholder="e.g., Central Park, NYC"
                            value={photo.location}
                            onChange={(e) => updatePhoto(photo.id, "location", e.target.value)}
                            className="mt-1"
                            disabled={photo.uploadStatus === 'uploading'}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`category-${photo.id}`} className="text-romantic-text font-medium">
                            Category
                          </Label>
                          <Select
                            value={photo.category}
                            onValueChange={(value) => updatePhoto(photo.id, "category", value)}
                            disabled={photo.uploadStatus === 'uploading'}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dates">Dates</SelectItem>
                              <SelectItem value="daily">Daily Life</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="adventure">Adventures</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`comment-${photo.id}`} className="text-romantic-text font-medium">
                          Memory & Story
                        </Label>
                        <Textarea
                          id={`comment-${photo.id}`}
                          placeholder="Tell the story behind this moment... What made it special? How did you feel? What do you remember most?"
                          value={photo.comment}
                          onChange={(e) => updatePhoto(photo.id, "comment", e.target.value)}
                          className="mt-1 min-h-[100px]"
                          disabled={photo.uploadStatus === 'uploading'}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {photos.length > 0 && !uploadComplete && (
          <div className="text-center">
            <Button
              onClick={handleUpload}
              disabled={uploading || photos.some(p => !p.title.trim())}
              size="lg"
              className="bg-romantic-sky-deep hover:bg-romantic-sky text-white rounded-full px-8 py-4 text-lg font-medium disabled:opacity-50"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading {photos.filter(p => p.uploadStatus === 'uploading').length}/{photos.length}...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>
                    Upload {photos.length} Photo{photos.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </Button>
            
            {photos.some(p => !p.title.trim()) && (
              <p className="text-sm text-red-500 mt-2">
                Please add titles to all photos before uploading
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 bg-romantic-cream-light/50 border-romantic-gold/20">
          <CardHeader>
            <CardTitle className="text-romantic-text flex items-center space-x-2">
              <Heart className="w-5 h-5 text-romantic-pink-deep" />
              <span>Tips for Beautiful Memories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-romantic-text/80 space-y-2">
            <p>• Add detailed stories to make each photo more meaningful</p>
            <p>• Include the location to remember where special moments happened</p>
            <p>• Use descriptive titles that capture the essence of the moment</p>
            <p>• Don't forget to mention how you felt in that moment</p>
            <p>• Photo titles are required for upload</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
