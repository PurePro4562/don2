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
        className="absolute top-6 md:top-8 left-6 md:left-8 mt-safe ml-safe bg-black/50 hover:bg-black/80 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full text-white/90 text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-colors cursor-pointer z-50 group"
      >
        <X size={18} className="group-hover:scale-110 transition-transform" />
        <span className="font-bold">Exit</span>
      </button>
    </div>
  );
}
