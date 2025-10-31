import { NextRequest, NextResponse } from 'next/server';
import { listPhotos, deletePhoto } from '@/lib/blob';
import { isDateInCurrentWeek } from '@/lib/dateUtils';

export async function GET() {
  try {
    const allPhotos = await listPhotos();

    // Filter to current week
    // Use timestamp directly since it's timezone-independent (milliseconds since epoch)
    const currentWeekPhotos = allPhotos.filter((photo) => {
      return isDateInCurrentWeek(photo.timestamp);
    });

    return NextResponse.json({ photos: currentWeekPhotos });
  } catch (error) {
    console.error('List photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      );
    }

    await deletePhoto(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

