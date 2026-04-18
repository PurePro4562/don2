import { Media } from '../types';

const API_KEY = '8740ac23d4f0f8aed9ededcd52d5a901';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTMDB = async (endpoint: string): Promise<Media[]> => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
    const data = await res.json();
    return data.results.filter((item: Media) => item.backdrop_path);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const searchTMDB = async (query: string): Promise<Media[]> => {
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results.filter((item: Media) => item.backdrop_path && (item.media_type === 'movie' || item.media_type === 'tv'));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchById = async (type: 'movie' | 'tv', id: number): Promise<Media> => {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    return { ...data, media_type: type };
  } catch (e) {
    console.error(e);
    return null as any;
  }
};

export const fetchCredits = async (type: 'movie' | 'tv', id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchSeasonDetails = async (tvId: number, seasonNumber: number) => {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchByGenre = async (type: 'movie' | 'tv', genreId: number): Promise<Media[]> => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}`);
    const data = await res.json();
    return data.results.filter((item: Media) => item.backdrop_path).map((item: any) => ({ ...item, media_type: type }));
  } catch (e) {
    console.error(e);
    return [];
  }
};
