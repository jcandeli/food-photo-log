import { put, list, del } from "@vercel/blob";
import sharp from "sharp";

interface PhotoMetadata {
  uploadDate: string;
  description?: string;
  timestamp: number;
}

// Encode metadata in filename using the old format: {timestamp}_{base64desc}_{originalname}
function encodeFilename(
  timestamp: number,
  description: string | undefined,
  originalName: string
): string {
  // Use old format with base64-encoded description
  const base64Desc = description
    ? Buffer.from(description).toString("base64")
    : "";
  // Clean up original name - remove extension and special chars
  const cleanName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "");

  if (base64Desc) {
    return `${timestamp}_${base64Desc}_${cleanName}`;
  } else {
    return `${timestamp}__${cleanName}`; // double underscore when no description
  }
}

// Parse metadata from filename
// Current format: {timestamp}_{base64desc}_{originalname} or {timestamp}_{base64desc}_{originalname}-{randsuffix}
// Legacy format: photo-{timestamp} or photo-{timestamp}-{randsuffix} (no description)
function parseFilename(
  filename: string
): { timestamp: number; description?: string } | null {
  // Remove .jpg extension
  const withoutExt = filename.replace(/\.jpg$/, "");
  // Remove random suffix (format: -XXXXXX where X is alphanumeric)
  const withoutSuffix = withoutExt.replace(/-[a-zA-Z0-9]+$/, "");

  // Try new format first: photo-{timestamp}
  if (withoutSuffix.startsWith("photo-")) {
    const timestampStr = withoutSuffix.replace("photo-", "");
    const timestamp = parseInt(timestampStr, 10);
    if (!isNaN(timestamp)) {
      return { timestamp };
    }
  }

  // Fall back to old format: {timestamp}_{base64desc}_{originalname}
  const parts = withoutSuffix.split("_");
  if (parts.length < 1) return null;

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return null;

  let description: string | undefined;
  if (parts.length >= 2 && parts[1] && parts[1].length > 0) {
    try {
      const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
      description = decoded.length > 0 ? decoded : undefined;
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

  // Since client already resized/compressed, just ensure proper orientation and format
  const image = sharp(buffer);

  // Rotate based on EXIF orientation if needed, then output as JPEG
  const processedBuffer = await image
    .rotate() // Auto-rotate based on EXIF orientation
    .jpeg({ quality: 90, mozjpeg: true }) // High quality since already compressed
    .toBuffer();

  const uploadDate = new Date().toISOString();
  const timestamp = Date.now();

  const encodedFilename = encodeFilename(timestamp, description, file.name);

  const blob = await put(`${encodedFilename}.jpg`, processedBuffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    uploadDate,
    timestamp,
  };
}

export async function listPhotos(): Promise<
  Array<{
    url: string;
    uploadDate: string;
    description?: string;
    timestamp: number;
  }>
> {
  const { blobs } = await list();

  const photos = blobs
    .filter((blob) => blob.pathname.endsWith(".jpg"))
    .map((blob) => {
      // Parse filename to get timestamp and description
      const filename = blob.pathname.split("/").pop() || blob.pathname;
      const parsed = parseFilename(filename);

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
