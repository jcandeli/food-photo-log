'use client';

import { useEffect, useState } from 'react';
import { WeekView } from '@/components/WeekView';
import { Photo, DayGroup } from '@/types/photo';
import { groupPhotosByDay } from '@/lib/dateUtils';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/photos');
        const data = await response.json();
        if (response.ok) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  const dayGroups: DayGroup[] = groupPhotosByDay(photos);

  return <WeekView dayGroups={dayGroups} isLoading={isLoading} />;
}

