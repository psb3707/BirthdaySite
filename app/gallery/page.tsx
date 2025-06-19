"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Filter, 
  Grid3X3, 
  List, 
  Loader2, 
  RefreshCw,
  Trash2,
  X,
  MoreVertical,
  AlertTriangle
} from "lucide-react"

interface Photo {
  id: string
  title: string
  date: string
  location: string
  comment: string
  category: string
  url: string
  publicId: string
  uploadedAt: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Photo | null>(null)

  const categories = [
    { value: 'all', label: 'All Photos', color: 'bg-gray-100 text-gray-800' },
    { value: 'dates', label: 'Dates', color: 'bg-romantic-pink-light text-romantic-pink-deep' },
    { value: 'daily', label: 'Daily Life', color: 'bg-romantic-sky-light text-romantic-sky-deep' },
    { value: 'travel', label: 'Travel', color: 'bg-romantic-gold/20 text-romantic-gold' },
    { value: 'adventure', label: 'Adventures', color: 'bg-green-100 text-green-700' }
  ]

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/photos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPhotos(data.photos || [])
        setFilteredPhotos(data.photos || [])
      } else {
        throw new Error(data.error || 'Failed to fetch photos')
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      setError(error.message || 'Failed to load photos')
      
      try {
        const localPhotos = localStorage.getItem('gallery-photos')
        if (localPhotos) {
          const parsedPhotos = JSON.parse(localPhotos)
          setPhotos(parsedPhotos)
          setFilteredPhotos(parsedPhotos)
          console.log('Loaded photos from localStorage backup')
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError)
      }
    } finally {
      setLoading(false)
    }
  }

  // 사진 삭제 함수
  const deletePhoto = async (photo: Photo) => {
    try {
      setDeleteLoading(photo.id)
      
      const response = await fetch(`/api/photos?id=${photo.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // 로컬 상태에서 사진 제거
        const updatedPhotos = photos.filter(p => p.id !== photo.id)
        setPhotos(updatedPhotos)
        setFilteredPhotos(updatedPhotos.filter(p => 
          selectedCategory === 'all' || p.category === selectedCategory
        ))
        
        // localStorage 백업도 업데이트
        localStorage.setItem('gallery-photos', JSON.stringify(updatedPhotos))
        
        // 모달 닫기
        setShowDeleteConfirm(null)
        setSelectedPhoto(null)
        
        // 성공 메시지 (선택사항)
        console.log('Photo deleted successfully:', photo.title)
      } else {
        throw new Error(data.error || 'Failed to delete photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert(`삭제 실패: ${error.message}`)
    } finally {
      setDeleteLoading(null)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPhotos(photos)
    } else {
      setFilteredPhotos(photos.filter(photo => photo.category === selectedCategory))
    }
  }, [photos, selectedCategory])

  const handleRefresh = () => {
    fetchPhotos()
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.color || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-romantic-pink-deep mx-auto mb-4" />
          <p className="text-romantic-text text-lg">Loading our beautiful memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-romantic-gradient">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Button asChild variant="ghost" className="text-romantic-text hover:text-romantic-pink-deep">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back Home</span>
            </Link>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-romantic-pink-deep animate-heart-beat" />
            <span className="font-serif text-xl text-romantic-text font-semibold">Our Gallery</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-romantic-text border-romantic-text/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button asChild className="bg-romantic-sky-deep hover:bg-romantic-sky text-white">
              <Link href="/upload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Add Photos</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-romantic-text mb-4">Our Beautiful Journey</h1>
          <p className="text-romantic-text/80 max-w-2xl mx-auto">
            Every photo tells a story, every moment captured is a treasure. Here's our collection of love, laughter, and life.
          </p>
        </div>

        {/* Stats and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-romantic-text">{photos.length}</div>
              <div className="text-sm text-romantic-text/70">Total Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-romantic-text">{filteredPhotos.length}</div>
              <div className="text-sm text-romantic-text/70">Showing</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-white/30 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-romantic-pink-deep' 
                    : 'text-romantic-text/70 hover:text-romantic-text'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-romantic-pink-deep' 
                    : 'text-romantic-text/70 hover:text-romantic-text'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.value
                  ? category.color + ' scale-105 shadow-lg'
                  : 'bg-white/30 text-romantic-text/70 hover:bg-white/50'
              }`}
            >
              {category.label}
              {category.value !== 'all' && (
                <span className="ml-2 bg-white/30 px-2 py-1 rounded-full text-xs">
                  {photos.filter(p => p.category === category.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center">
            <p>{error}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Photos Display */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/30 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-romantic-sky-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-romantic-sky-deep" />
              </div>
              <h3 className="text-xl font-semibold text-romantic-text mb-4">
                {selectedCategory === 'all' ? 'No Photos Yet' : 'No Photos in This Category'}
              </h3>
              <p className="text-romantic-text/80 mb-6">
                {selectedCategory === 'all' 
                  ? "Let's start building our gallery! Upload your first photo to begin our beautiful journey."
                  : `No photos found in the "${categories.find(c => c.value === selectedCategory)?.label}" category yet.`
                }
              </p>
              <Button asChild className="bg-romantic-sky-deep hover:bg-romantic-sky text-white">
                <Link href="/upload">Upload First Photo</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                  <Card
                    key={photo.id}
                    className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative"
                  >
                    <CardContent className="p-0">
                      {/* 삭제 버튼 - 항상 표시 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(photo)
                        }}
                        disabled={deleteLoading === photo.id}
                        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                        title="Delete photo"
                      >
                        {deleteLoading === photo.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>

                      <div 
                        className="relative aspect-[4/5] overflow-hidden rounded-t-lg"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <Badge className={`absolute top-3 left-3 ${getCategoryColor(photo.category)}`}>
                          {categories.find(c => c.value === photo.category)?.label || photo.category}
                        </Badge>
                        
                        <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-semibold text-sm mb-1 truncate">{photo.title}</h3>
                          {photo.location && (
                            <div className="flex items-center text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate">{photo.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-romantic-text mb-2 truncate">{photo.title}</h3>
                        
                        <div className="space-y-2 text-sm text-romantic-text/70">
                          {photo.date && (
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-2 text-romantic-pink-deep" />
                              <span>{new Date(photo.date).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {photo.comment && (
                            <div className="flex items-start">
                              <MessageCircle className="w-3 h-3 mr-2 mt-0.5 text-romantic-sky-deep flex-shrink-0" />
                              <span className="line-clamp-2">{photo.comment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredPhotos.map((photo) => (
                  <Card
                    key={photo.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative group"
                  >
                    <CardContent className="p-6">
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(photo)
                        }}
                        disabled={deleteLoading === photo.id}
                        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                        title="Delete photo"
                      >
                        {deleteLoading === photo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      <div 
                        className="flex gap-6 cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={photo.url}
                            alt={photo.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-semibold text-romantic-text pr-12">{photo.title}</h3>
                            <Badge className={getCategoryColor(photo.category)}>
                              {categories.find(c => c.value === photo.category)?.label || photo.category}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-romantic-text/70">
                            {photo.date && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-romantic-pink-deep" />
                                <span>{new Date(photo.date).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {photo.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-romantic-sky-deep" />
                                <span>{photo.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {photo.comment && (
                            <div className="flex items-start">
                              <MessageCircle className="w-4 h-4 mr-2 mt-0.5 text-romantic-sky-deep flex-shrink-0" />
                              <p className="text-romantic-text/80 line-clamp-3">{photo.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 닫기 버튼 */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 모달 내 삭제 버튼 */}
              <button
                onClick={() => setShowDeleteConfirm(selectedPhoto)}
                disabled={deleteLoading === selectedPhoto.id}
                className="absolute top-4 right-16 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors disabled:opacity-50"
                title="Delete photo"
              >
                {deleteLoading === selectedPhoto.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
              
              <div className="aspect-[4/3] relative rounded-t-3xl overflow-hidden">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-3xl font-serif text-romantic-text">{selectedPhoto.title}</h2>
                  <Badge className={getCategoryColor(selectedPhoto.category)}>
                    {categories.find(c => c.value === selectedPhoto.category)?.label || selectedPhoto.category}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {selectedPhoto.date && (
                    <div className="flex items-center text-romantic-text/70">
                      <Calendar className="w-5 h-5 mr-3 text-romantic-pink-deep" />
                      <span>{new Date(selectedPhoto.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {selectedPhoto.location && (
                    <div className="flex items-center text-romantic-text/70">
                      <MapPin className="w-5 h-5 mr-3 text-romantic-sky-deep" />
                      <span>{selectedPhoto.location}</span>
                    </div>
                  )}
                </div>
                
                {selectedPhoto.comment && (
                  <div className="bg-romantic-cream-light/30 rounded-2xl p-6">
                    <div className="flex items-start">
                      <MessageCircle className="w-5 h-5 mr-3 mt-1 text-romantic-sky-deep flex-shrink-0" />
                      <p className="text-romantic-text leading-relaxed">{selectedPhoto.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full mx-4 relative">
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Photo?</h3>
                
                <div className="mb-4">
                  <div className="relative w-32 h-40 mx-auto mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={showDeleteConfirm.url}
                      alt={showDeleteConfirm.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-gray-600 font-medium">{showDeleteConfirm.title}</p>
                  {showDeleteConfirm.date && (
                    <p className="text-sm text-gray-500">{new Date(showDeleteConfirm.date).toLocaleDateString()}</p>
                  )}
                </div>
                
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. The photo will be permanently deleted from both our gallery and cloud storage.
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(null)}
                    variant="outline"
                    className="flex-1"
                    disabled={deleteLoading === showDeleteConfirm.id}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deletePhoto(showDeleteConfirm)}
                    disabled={deleteLoading === showDeleteConfirm.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteLoading === showDeleteConfirm.id ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </div>
                    ) : (
                      'Delete Photo'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}