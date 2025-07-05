// app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' }, 
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const comment = formData.get('comment') as string;
    const category = formData.get('category') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' }, 
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB로 제한 - 서버리스 함수 제한 고려)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 5MB)' }, 
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' }, 
        { status: 400 }
      );
    }

    // File을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary에 업로드
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'our-memories',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
          // 메타데이터를 tags로 저장 (Search API 대신)
          tags: [category, 'our-memories'],
          // public_id에 날짜 포함으로 정렬 가능하게
          public_id: `our-memories/${Date.now()}_${title.replace(/[^a-zA-Z0-9]/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: 업로드 페이지에서 호출될 수 있는 GET 요청 처리
export async function GET() {
  // 업로드 페이지에서는 특별한 데이터가 필요없으므로 빈 응답 반환
  return NextResponse.json({
    success: true,
    message: 'Upload endpoint ready'
  });
}

// GET 요청 제거 - 업로드 페이지에서는 필요없음