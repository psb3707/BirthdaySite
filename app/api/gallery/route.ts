// app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json');

// 데이터 폴더 생성
async function ensureDataDir() {
  const dataDir = path.dirname(PHOTOS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 사진 데이터 읽기
async function readPhotos() {
  try {
    const data = await fs.readFile(PHOTOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // 파일이 없으면 빈 배열 반환
    return [];
  }
}

// GET: 갤러리용 사진 목록 조회
export async function GET() {
  try {
    const photos = await readPhotos();
    
    // 최신순으로 정렬
    photos.sort((a: any, b: any) => 
      new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      photos: photos,
      count: photos.length
    });
  } catch (error) {
    console.error('Error reading photos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to read photos',
        photos: [] // 에러시 빈 배열 반환
      },
      { status: 500 }
    );
  }
}