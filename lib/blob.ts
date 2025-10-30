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

  // Resize image: max width 1920px, maintain aspect ratio, quality 85%
  const resizedBuffer = await sharp(buffer)
    .resize(1920, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .jpeg({ quality: 85 })
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

