// app/api/photos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

const PHOTOS_FILE_PATH = path.join(process.cwd(), 'data', 'photos.json')

// 데이터 폴더가 없으면 생성
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 사진 데이터 읽기
function readPhotos(): Photo[] {
  ensureDataDirectory()
  
  try {
    if (fs.existsSync(PHOTOS_FILE_PATH)) {
      const data = fs.readFileSync(PHOTOS_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading photos:', error)
    return []
  }
}

// 사진 데이터 저장
function writePhotos(photos: Photo[]) {
  ensureDataDirectory()
  
  try {
    fs.writeFileSync(PHOTOS_FILE_PATH, JSON.stringify(photos, null, 2))
  } catch (error) {
    console.error('Error writing photos:', error)
    throw error
  }
}

// GET: 모든 사진 조회
export async function GET() {
  try {
    const photos = readPhotos()
    
    // 최신 업로드 순으로 정렬
    photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    return NextResponse.json({
      success: true,
      photos,
      count: photos.length
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// POST: 새 사진 추가
export async function POST(request: NextRequest) {
  try {
    const photoData = await request.json()
    
    // 필수 필드 검증
    if (!photoData.title || !photoData.url) {
      return NextResponse.json(
        { success: false, error: 'Title and URL are required' },
        { status: 400 }
      )
    }
    
    const photos = readPhotos()
    
    const newPhoto: Photo = {
      id: generateId(),
      title: photoData.title,
      date: photoData.date || new Date().toISOString().split('T')[0],
      location: photoData.location || '',
      comment: photoData.comment || '',
      category: photoData.category || 'daily',
      url: photoData.url,
      publicId: photoData.publicId || '',
      uploadedAt: new Date().toISOString()
    }
    
    photos.push(newPhoto)
    writePhotos(photos)
    
    console.log('Photo saved successfully:', newPhoto.title)
    
    return NextResponse.json({
      success: true,
      photo: newPhoto,
      message: 'Photo saved successfully'
    })
  } catch (error) {
    console.error('Error saving photo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save photo' },
      { status: 500 }
    )
  }
}

// DELETE: 사진 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')
    
    if (!photoId) {
      return NextResponse.json(
        { success: false, error: 'Photo ID is required' },
        { status: 400 }
      )
    }
    
    const photos = readPhotos()
    const filteredPhotos = photos.filter(photo => photo.id !== photoId)
    
    if (photos.length === filteredPhotos.length) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      )
    }
    
    writePhotos(filteredPhotos)
    
    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}

// 고유 ID 생성
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}