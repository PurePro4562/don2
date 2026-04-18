export interface Media {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  overview: string;
  seasons?: any[];
  first_air_date?: string;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
  history: Media[];
  favorites: Media[];
}
