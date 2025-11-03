import { NextResponse } from "next/server";
import { listPhotos, deletePhoto } from "@/lib/blob";

export async function POST() {
  try {
    const allPhotos = await listPhotos();

    // Delete all photos
    const deletePromises = allPhotos.map((photo) => deletePhoto(photo.url));
    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      deletedCount: allPhotos.length
    });
  } catch (error) {
    console.error("Delete all photos error:", error);
    return NextResponse.json(
      { error: "Failed to delete all photos" },
      { status: 500 }
    );
  }
}

