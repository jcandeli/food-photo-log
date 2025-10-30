import { put, list, del } from '@vercel/blob';
import sharp from 'sharp';

interface PhotoMetadata {
  uploadDate: string;
  description?: string;
  timestamp: number;
}

// Encode metadata in filename: {timestamp}_{base64description}_{originalname}
function encodeFilename(timestamp: number, description: string | undefined, originalName: string): string {
  const desc = description ? Buffer.from(description).toString('base64') : '';
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${desc}_${cleanName}`;
}

// Parse metadata from filename
// Format: {timestamp}_{base64desc}_{originalname} or {timestamp}_{base64desc}_{originalname}-{randsuffix}
function parseFilename(filename: string): { timestamp: number; description?: string } | null {
  // Remove .jpg extension
  const withoutExt = filename.replace(/\.jpg$/, '');
  // Remove random suffix (format: -XXXXXX where X is alphanumeric)
  const withoutSuffix = withoutExt.replace(/-[a-zA-Z0-9]+$/, '');

  const parts = withoutSuffix.split('_');
  if (parts.length < 1) return null;

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return null;

  let description: string | undefined;
  if (parts.length >= 2 && parts[1]) {
    try {
      description = Buffer.from(parts[1], 'base64').toString('utf-8') || undefined;
    } catch {
      // If base64 decode fails, ignore description
    }
  }

  return {
    timestamp,
    description,
  };
}

export async function uploadPhoto(
  file: File,
  description?: string
): Promise<{ url: string; uploadDate: string; timestamp: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process image with EXIF orientation handling
  // Read metadata to get EXIF orientation
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Build processing pipeline
  let pipeline = image;

  // Apply EXIF orientation to pixel data before resizing
  // This ensures the image is correctly oriented regardless of device
  if (metadata.orientation && metadata.orientation > 1) {
    // Handle common orientations (most phone photos use 6 or 8 for portrait)
    // Orientation 6 = 90° clockwise, Orientation 8 = 90° counter-clockwise
    switch (metadata.orientation) {
      case 2:
        // Horizontal flip
        pipeline = pipeline.flip();
        break;
      case 3:
        // 180° rotation
        pipeline = pipeline.rotate(180);
        break;
      case 4:
        // Vertical flip
        pipeline = pipeline.flop();
        break;
      case 5:
        // 90° counter-clockwise + horizontal flip
        pipeline = pipeline.rotate(-90).flip();
        break;
      case 6:
        // 90° clockwise (most common for portrait photos)
        pipeline = pipeline.rotate(90);
        break;
      case 7:
        // 90° clockwise + horizontal flip
        pipeline = pipeline.rotate(90).flip();
        break;
      case 8:
        // 90° counter-clockwise (common for portrait photos)
        pipeline = pipeline.rotate(-90);
        break;
    }
  }

  // Resize image: max width 1920px, maintain aspect ratio, quality 85%
  // After applying orientation, ensure EXIF orientation tag is removed from output
  const resizedBuffer = await pipeline
    .resize(1920, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .jpeg({ quality: 85 })
    .withMetadata({ orientation: 1 }) // Remove EXIF orientation tag (set to normal)
    .toBuffer();

  const uploadDate = new Date().toISOString();
  const timestamp = Date.now();

  const encodedFilename = encodeFilename(timestamp, description, file.name);

  const blob = await put(`${encodedFilename}.jpg`, resizedBuffer, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    uploadDate,
    timestamp,
  };
}

export async function listPhotos(): Promise<Array<{
  url: string;
  uploadDate: string;
  description?: string;
  timestamp: number;
}>> {
  const { blobs } = await list();

  const photos = blobs
    .filter((blob) => blob.pathname.endsWith('.jpg'))
    .map((blob) => {
      // Extract filename from pathname (remove path if any)
      const filename = blob.pathname.split('/').pop() || blob.pathname;
      // Remove the random suffix and .jpg extension to get the encoded name
      const baseName = filename.replace(/-\w+\.jpg$/, '').replace(/\.jpg$/, '');
      const parsed = parseFilename(baseName);

      if (!parsed) {
        // Fallback: use uploadedAt date if parsing fails
        return {
          url: blob.url,
          uploadDate: blob.uploadedAt.toISOString(),
          timestamp: blob.uploadedAt.getTime(),
        };
      }

      return {
        url: blob.url,
        uploadDate: new Date(parsed.timestamp).toISOString(),
        description: parsed.description,
        timestamp: parsed.timestamp,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  return photos;
}

export async function deletePhoto(url: string): Promise<void> {
  await del(url);
}

