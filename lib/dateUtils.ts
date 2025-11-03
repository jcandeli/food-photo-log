import { Photo, DayGroup } from '@/types/photo';

// Get local date string in YYYY-MM-DD format (not UTC)
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export function formatDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isDateInCurrentWeek(date: Date | number): boolean {
  const { start, end } = getCurrentWeekRange();
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  return dateObj >= start && dateObj <= end;
}

export function groupPhotosByDay(photos: Photo[]): DayGroup[] {
  const groups: Map<string, DayGroup> = new Map();

  // Group photos by day
  // Use timestamp directly since it's timezone-independent (milliseconds since epoch)
  photos.forEach((photo) => {
    const photoDate = new Date(photo.timestamp);
    const dayKey = getLocalDateString(photoDate);

    // Create group if it doesn't exist
    if (!groups.has(dayKey)) {
      groups.set(dayKey, {
        dayOfWeek: formatDayOfWeek(photoDate),
        date: formatDate(photoDate),
        photos: [],
      });
    }

    const group = groups.get(dayKey);
    if (group) {
      group.photos.push(photo);
    }
  });

  // Sort photos within each day by timestamp (oldest first)
  groups.forEach((group) => {
    group.photos.sort((a, b) => a.timestamp - b.timestamp);
  });

  // Sort days by date (newest first) using the first photo's timestamp in each group
  return Array.from(groups.values()).sort((a, b) => {
    const timestampA = a.photos[0]?.timestamp || 0;
    const timestampB = b.photos[0]?.timestamp || 0;
    return timestampB - timestampA;
  });
}

