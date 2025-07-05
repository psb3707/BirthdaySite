"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, Camera, Loader2, ChevronLeft, ChevronRight, Play, Pause, Upload, X, Trash2, MoreHorizontal, RefreshCw } from "lucide-react"
import CelebrationEffect from "@/components/celebration-effect"

const navItems = [
  { href: "/", label: "홈" },
  { href: "/letter", label: "편지" },
  { href: "/gallery", label: "갤러리" },
  { href: "/upload", label: "업로드" },
]


// 기본 샘플 이미지들
const defaultImages = [
  { 
    id: 'default-1',
    src: "/placeholder.svg?height=600&width=500", 
    caption: "너와 함께하는 모든 순간이 소중해", 
    date: "2024년 3월 15일", 
    aspectRatio: "3/4",
    objectPosition: "center center"
  },
  { 
    id: 'default-2',
    src: "/placeholder.svg?height=600&width=500", 
    caption: "우리의 첫 번째 데이트", 
    date: "2024년 2월 22일", 
    aspectRatio: "3/4",
    objectPosition: "center center"
  },
  { 
    id: 'default-3',
    src: "/placeholder.svg?height=600&width=500", 
    caption: "함께 웃던 그 날", 
    date: "2024년 4월 1일", 
    aspectRatio: "3/4",
    objectPosition: "center center"
  },
]

interface SlideImage {
  id: string
  src: string
  caption: string
  date: string
  aspectRatio: string
  objectPosition?: string
  category?: string
}

interface GalleryPhoto {
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

export default function HomePage(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false)
  const [slideImages, setSlideImages] = useState<SlideImage[]>(defaultImages)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false)
  const [daysCount, setDaysCount] = useState<number>(0)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [showCelebration, setShowCelebration] = useState<boolean>(false)
  const slideShowRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // 2024년 2월 22일부터 현재까지의 날짜 계산
    const startDate = new Date("2024-02-22")
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysCount(diffDays)

    // 500일 축하 이펙트 표시 (정확히 500일일 때만)
    if (diffDays === 500) {
      setShowCelebration(true)
    }

    // 갤러리 사진 로드
    loadGalleryPhotos()
  }, [])

  // 갤러리에서 사진 가져오기
  const loadGalleryPhotos = async () => {
    try {
      setIsLoadingGallery(true)
      
      const response = await fetch('/api/photos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.photos.length > 0) {
          setGalleryPhotos(data.photos)
          
          // 갤러리 사진 중 랜덤 5개 선택하여 슬라이드쇼 업데이트
          const randomPhotos = getRandomPhotos(data.photos, 5)
          const slideImagesFromGallery = randomPhotos.map(photo => ({
            id: photo.id,
            src: getSlideShowOptimizedUrl(photo.url), // 카테고리 구분 없이 중앙 기준
            caption: photo.comment || photo.title,
            date: formatDate(photo.date),
            aspectRatio: "4/5", // 모든 이미지가 동일한 비율
            objectPosition: "center center",
            category: photo.category
          }))
          
          setSlideImages(slideImagesFromGallery)
          setCurrentImageIndex(0)
        }
      } else {
        console.log('No photos found in gallery, using default images')
      }
    } catch (error) {
      console.error('Error loading gallery photos:', error)
      // 에러 발생시 기본 이미지 사용
    } finally {
      setIsLoadingGallery(false)
    }
  }

  // 랜덤하게 사진 선택 (Fisher-Yates 셔플 알고리즘)
  const getRandomPhotos = (photos: GalleryPhoto[], count: number): GalleryPhoto[] => {
    const shuffled = [...photos].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, photos.length))
  }

  // Cloudinary URL 최적화 함수 - 전체 이미지 보존하면서 크기만 조정
  const getSlideShowOptimizedUrl = (originalUrl: string): string => {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl
    }

    // c_fit: 전체 이미지를 보존하면서 컨테이너에 맞춤 (crop 없음, 여백 생길 수 있음)
    // 또는 c_scale: 단순 크기 조정 (비율 무시하고 강제로 맞춤)
    const transformation = 'c_fit,w_388,h_485,q_auto,f_auto'
    
    return originalUrl.replace('/upload/', `/upload/${transformation}/`)
  }

  // 이미지 비율에 따른 스마트 표시 모드 결정
  const getImageDisplayMode = (image: SlideImage) => {
    // 세로가 긴 이미지는 contain, 가로가 긴 이미지는 cover
    if (image.aspectRatio === "3/4" || image.aspectRatio === "4/5") {
      return "contain" // 세로 이미지는 전체를 보여줌
    } else {
      return "cover" // 가로 이미지는 크롭해서 보여줌
    }
  }

  // 이미지 배경색 결정 (contain 모드일 때)
  const getImageBackground = (image: SlideImage) => {
    switch (image.category) {
      case 'travel':
        return 'bg-sky-50'
      case 'dates':
        return 'bg-pink-50'
      case 'daily':
        return 'bg-blue-50'
      default:
        return 'bg-gray-50'
    }
  }

  // 스마트 오브젝트 포지션 결정
  const getSmartObjectPosition = (photo: GalleryPhoto): string => {
    // 카테고리별로 다른 크롭 전략 적용
    switch (photo.category) {
      case 'dates':
        return "center 30%" // 상단 중심 (얼굴이 나올 가능성 높음)
      case 'travel':
        return "center center" // 중앙 (풍경 사진)
      case 'daily':
        return "center 35%" // 약간 상단
      case 'adventure':
        return "center 40%" // 중앙에서 약간 상단
      default:
        return "center center"
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // 갤러리 새로고침
  const refreshGallery = () => {
    loadGalleryPhotos()
  }

  // 자동 슬라이드쇼
  useEffect(() => {
    if (isPlaying && slideImages.length > 1) {
      slideShowRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideImages.length)
      }, 4000)
    } else {
      if (slideShowRef.current) {
        clearInterval(slideShowRef.current)
      }
    }

    return () => {
      if (slideShowRef.current) {
        clearInterval(slideShowRef.current)
      }
    }
  }, [isPlaying, slideImages.length])

  // 이전/다음 이미지
  const goToPrevious = useCallback(() => {
    setSlideDirection('left')
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? slideImages.length - 1 : prevIndex - 1
    )
  }, [slideImages.length])

  const goToNext = useCallback(() => {
    setSlideDirection('right')
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideImages.length)
  }, [slideImages.length])

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPrevious()
      } else if (event.key === "ArrowRight") {
        goToNext()
      } else if (event.key === " ") {
        event.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [goToPrevious, goToNext, isPlaying])

  if (!mounted) return null

  const currentImage = slideImages[currentImageIndex]

  return (
    <div className="min-h-screen bg-romantic-gradient overflow-hidden">
      {/* 500일 축하 이펙트 */}
      {showCelebration && (
        <CelebrationEffect onComplete={() => setShowCelebration(false)} />
      )}
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-romantic-gold" />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-korean text-xl text-romantic-text font-semibold">말랑이</span>
            <Heart className="w-6 h-6 text-romantic-pink-deep animate-heart-beat fill-current" />
            <span className="font-korean text-xl text-romantic-text font-semibold">너구리</span>
          </div>

          <div className="hidden md:flex space-x-3">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-6 py-3 rounded-full text-sm font-medium font-korean
                         bg-white/20 backdrop-blur-md border border-white/30
                         text-romantic-text hover:bg-white/35 hover:text-romantic-pink-deep
                         transition-all duration-300 hover:shadow-lg hover:scale-105
                         active:scale-95 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-romantic-pink-light/30 to-romantic-sky-light/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-romantic-gold rounded-full opacity-0 group-hover:opacity-100 animate-sparkle"></div>
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden flex space-x-2">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-xs rounded-full font-korean
                         bg-white/25 backdrop-blur-sm border border-white/20
                         text-romantic-text font-medium
                         hover:bg-white/35 hover:text-romantic-pink-deep 
                         transition-all duration-200 hover:scale-105"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-serif text-5xl lg:text-6xl text-romantic-text leading-tight">
                사랑하는
                <span className="block text-romantic-pink-deep font-korean">채원이에게</span>
              </h1>
              <p className="text-lg text-romantic-text/80 leading-relaxed max-w-md font-korean">
                우리가 함께 만든 모든 순간들을 담은 특별한 공간이야. {daysCount}일 동안 쌓아온 우리만의 아름다운
                추억들을 여기서 영원히 간직할게.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-romantic-sky-deep hover:bg-romantic-sky text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/gallery" className="flex items-center space-x-2 font-korean">
                  <Camera className="w-5 h-5" />
                  <span>우리 추억 보기</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-romantic-pink-deep text-romantic-pink-deep hover:bg-romantic-pink-light rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
              >
                <Link href="/letter" className="flex items-center space-x-2 font-korean">
                  <Heart className="w-5 h-5" />
                  <span>편지 읽기</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-romantic-text">{galleryPhotos.length || slideImages.length}</div>
                <div className="text-sm text-romantic-text/70 font-korean">사진</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-romantic-text">{daysCount}</div>
                <div className="text-sm text-romantic-text/70 font-korean">함께한 날</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-romantic-text">∞</div>
                <div className="text-sm text-romantic-text/70 font-korean">사랑</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Slideshow */}
          <div className="relative animate-fade-in lg:justify-self-end" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-romantic-pink-light rounded-full opacity-50 animate-float"></div>
              <div
                className="absolute -bottom-6 -right-6 w-32 h-32 bg-romantic-cream-light rounded-full opacity-40 animate-float"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Loading State */}
              {isLoadingGallery && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-romantic-pink-deep mx-auto mb-2" />
                    <p className="text-sm text-romantic-text font-korean">갤러리에서 사진 가져오는 중...</p>
                  </div>
                </div>
              )}

              {/* Slideshow Container - Enhanced */}
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 group w-[420px]">
                {/* Gallery Status Indicator */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="flex items-center space-x-2">
                    {galleryPhotos.length > 0 && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-korean">
                        갤러리 연동
                      </div>
                    )}
                    <Button
                      onClick={refreshGallery}
                      size="sm"
                      className="bg-romantic-sky-deep hover:bg-romantic-sky text-white rounded-full p-2"
                      title="새로운 사진 가져오기"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Enhanced Image Container with Smart Background */}
                <div className="relative overflow-hidden rounded-2xl w-[388px] h-[485px]">
                  {/* Gradient Background for better appearance with c_fit */}
                  <div className="absolute inset-0 bg-gradient-to-br from-romantic-cream-light via-white to-romantic-sky-light"></div>
                  
                  <div 
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{ 
                      transform: `translateX(-${currentImageIndex * 388}px)`, // 픽셀 단위로 정확한 이동
                      width: `${slideImages.length * 388}px` // 총 너비를 픽셀로 설정
                    }}
                  >
                    {slideImages.map((image, index) => (
                      <div key={image.id} className="relative flex-shrink-0 h-full" style={{ width: '388px' }}>
                        {/* Image with proper sizing */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={image.src}
                            alt={`우리의 소중한 순간 ${index + 1}`}
                            fill
                            className="rounded-lg transition-all duration-500 object-contain"
                            priority={index === currentImageIndex}
                          />
                          
                          {/* Category Badge */}
                          {image.category && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="bg-white/80 backdrop-blur-sm text-romantic-text text-xs px-2 py-1 rounded-full font-korean">
                                {image.category === 'dates' ? '데이트' : 
                                 image.category === 'daily' ? '일상' :
                                 image.category === 'travel' ? '여행' :
                                 image.category === 'adventure' ? '모험' : image.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Controls Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between p-4">
                    <Button
                      onClick={goToPrevious}
                      size="sm"
                      className="bg-white/90 text-romantic-text hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        size="sm"
                        className="bg-white/90 text-romantic-text hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        onClick={refreshGallery}
                        size="sm"
                        className="bg-romantic-gold/90 text-white hover:bg-romantic-gold rounded-full p-2 shadow-lg"
                        title="새로운 랜덤 사진"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={goToNext}
                      size="sm"
                      className="bg-white/90 text-romantic-text hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Enhanced Image Counter */}
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-korean backdrop-blur-sm">
                    {currentImageIndex + 1} / {slideImages.length}
                    {galleryPhotos.length > 5 && (
                      <span className="ml-2 text-xs opacity-80">
                        (총 {galleryPhotos.length}개 중)
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Slideshow Indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                  {slideImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative transition-all duration-300 ${
                        index === currentImageIndex
                          ? "w-8 h-3 bg-romantic-pink-deep rounded-full"
                          : "w-3 h-3 bg-romantic-text/30 hover:bg-romantic-text/50 rounded-full"
                      }`}
                    >
                      {/* Progress indicator for current slide */}
                      {index === currentImageIndex && isPlaying && (
                        <div 
                          className="absolute inset-0 bg-romantic-gold rounded-full origin-left"
                          style={{
                            animation: 'slideProgress 4s linear infinite'
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Enhanced Polaroid-style caption */}
                <div className="mt-4 text-center">
                  <p className="font-korean text-romantic-text italic text-sm leading-relaxed">
                    "{currentImage?.caption}"
                  </p>
                  <p className="text-sm text-romantic-text/60 mt-1 font-korean">
                    {currentImage?.date}
                  </p>
                  {galleryPhotos.length > 0 && (
                    <p className="text-xs text-romantic-text/50 mt-1 font-korean">
                      💝 갤러리에서 랜덤 선택된 추억
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-white/20">
            <h2 className="font-serif text-2xl text-romantic-text mb-4 font-korean">우리의 여행을 시작할 준비됐어?</h2>
            <p className="text-romantic-text/80 mb-6 font-korean">
              소중한 순간들, 진심 담긴 편지, 그리고 우리가 함께 만든 아름다운 추억들을 천천히 둘러보자.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                asChild
                className="bg-romantic-gold hover:bg-romantic-gold/90 text-romantic-text rounded-full font-korean hover:scale-105 transition-transform"
              >
                <Link href="/gallery">탐험 시작하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}