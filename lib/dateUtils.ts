import { Photo, DayGroup } from '@/types/photo';

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

export function isDateInCurrentWeek(date: Date): boolean {
  const { start, end } = getCurrentWeekRange();
  return date >= start && date <= end;
}

export function groupPhotosByDay(photos: Photo[]): DayGroup[] {
  const { start } = getCurrentWeekRange();
  const groups: Map<string, DayGroup> = new Map();

  // Initialize all days of the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dayKey = date.toISOString().split('T')[0];
    groups.set(dayKey, {
      dayOfWeek: formatDayOfWeek(date),
      date: formatDate(date),
      photos: [],
    });
  }

  // Group photos by day
  photos.forEach((photo) => {
    const photoDate = new Date(photo.uploadDate);
    const dayKey = photoDate.toISOString().split('T')[0];
    const group = groups.get(dayKey);
    if (group) {
      group.photos.push(photo);
    }
  });

  // Sort photos within each day by timestamp (newest first)
  groups.forEach((group) => {
    group.photos.sort((a, b) => b.timestamp - a.timestamp);
  });

  return Array.from(groups.values());
}

