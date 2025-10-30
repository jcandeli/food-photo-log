export interface Photo {
  url: string;
  uploadDate: string;
  description?: string;
  timestamp: number;
}

export interface DayGroup {
  dayOfWeek: string;
  date: string;
  photos: Photo[];
}

