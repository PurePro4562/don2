import { useEffect } from 'react';
import { Media } from '../types';
import { X } from 'lucide-react';

interface PlayerProps {
  item: Media;
  season?: number;
  episode?: number;
  onClose: () => void;
}

export function Player({ item, season, episode, onClose }: PlayerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PLAYER_EVENT') {
        const history = JSON.parse(localStorage.getItem('app_history') || '{}');
        history[item.id] = e.data.payload;
        localStorage.setItem('app_history', JSON.stringify(history));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [item]);

  const isTV = item.media_type === 'tv' || item.name !== undefined;
  const finalUrl = isTV 
    ? `https://www.vidking.net/embed/tv/${item.id}/${season || 1}/${episode || 1}?color=ffffff&autoPlay=true&nextEpisode=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=ffffff&autoPlay=true`;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <iframe
        src={finalUrl}
        className="w-full h-full border-0"
        allowFullScreen
        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-modals allow-presentation"
      />
      <button 
        onClick={onClose}
        className="absolute top-6 md:top-10 left-6 md:left-10 mt-safe ml-safe glass p-4 md:p-5 rounded-full text-white/90 transition-all duration-500 hover:bg-white/20 hover:scale-110 shadow-2xl border-white/10 z-50 group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
}
