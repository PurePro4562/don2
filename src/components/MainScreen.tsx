import { useState, useEffect, useMemo, useRef } from 'react';
import { Media, Profile } from '../types';
import { fetchTMDB, fetchById, searchTMDB, fetchByGenre, fetchSeasonDetails, fetchCredits } from '../services/tmdb';
import { Search, Home, Film, Tv, Play, Heart, Info, UserCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const TOP_NAV = [
  { icon: Search, label: 'Search' },
  { icon: Home, label: 'Home' },
  { icon: Film, label: 'Movies' },
  { icon: Tv, label: 'TV Shows' },
  { icon: UserCircle, label: 'Switch Profile' }
];

const SEARCH_CATEGORIES = [
  { id: 28, name: 'Action', color: 'from-red-500 to-orange-500' },
  { id: 12, name: 'Adventure', color: 'from-amber-500 to-yellow-600' },
  { id: 16, name: 'Animation', color: 'from-purple-500 to-indigo-500' },
  { id: 35, name: 'Comedy', color: 'from-yellow-400 to-yellow-600' },
  { id: 80, name: 'Crime', color: 'from-stone-600 to-stone-800' },
  { id: 99, name: 'Documentary', color: 'from-green-500 to-emerald-700' },
  { id: 18, name: 'Drama', color: 'from-blue-600 to-indigo-800' },
  { id: 10751, name: 'Family', color: 'from-sky-400 to-blue-600' },
  { id: 14, name: 'Fantasy', color: 'from-fuchsia-500 to-purple-700' },
  { id: 36, name: 'History', color: 'from-yellow-700 to-amber-900' },
  { id: 27, name: 'Horror', color: 'from-neutral-700 to-neutral-900' },
  { id: 10402, name: 'Music', color: 'from-pink-500 to-rose-600' },
  { id: 9648, name: 'Mystery', color: 'from-indigo-600 to-blue-900' },
  { id: 10749, name: 'Romance', color: 'from-pink-400 to-pink-600' },
  { id: 878, name: 'Sci-Fi', color: 'from-blue-500 to-cyan-500' },
  { id: 53, name: 'Thriller', color: 'from-red-700 to-rose-900' },
];

interface MainScreenProps {
  profile: Profile;
  updateProfile: (p: Profile) => void;
  onPlay: (item: Media, season?: number, episode?: number) => void;
  onSwitchProfile: () => void;
}

export function MainScreen({ profile, updateProfile, onPlay, onSwitchProfile }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState('Home');
  const [banners, setBanners] = useState<Media[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const [trending, setTrending] = useState<Media[]>([]);
  const [movies, setMovies] = useState<Media[]>([]);
  const [tv, setTv] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedTv, setTopRatedTv] = useState<Media[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<{id: number, name: string} | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetchById('tv', 1396), // Breaking Bad
      fetchById('tv', 60059), // Better Call Saul
      fetchById('tv', 60625), // Rick and Morty
      fetchById('tv', 1405) // Dexter
    ]).then(res => setBanners(res.filter(Boolean)));

    fetchTMDB('/trending/all/week').then(setTrending);
    fetchTMDB('/movie/popular').then(setMovies);
    fetchTMDB('/tv/popular').then(setTv);
    fetchTMDB('/movie/top_rated').then(setTopRatedMovies);
    fetchTMDB('/tv/top_rated').then(setTopRatedTv);
  }, []);

  // Search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (!selectedGenre) setSearchResults([]);
      return;
    }
    setSelectedGenre(null); // Clear genre if typing
    const timeout = setTimeout(() => {
      searchTMDB(searchQuery).then(setSearchResults);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedGenre]);

  // Fetch by genre
  useEffect(() => {
    if (selectedGenre) {
      fetchByGenre('movie', selectedGenre.id).then(setSearchResults);
    }
  }, [selectedGenre]);

  const currentBanners = useMemo(() => {
    if (activeTab === 'Movies') return movies.slice(0, 5);
    if (activeTab === 'TV Shows') return tv.slice(0, 5);
    return banners;
  }, [activeTab, movies, tv, banners]);

  // Rotate banners
  useEffect(() => {
    if (currentBanners.length > 0 && activeTab !== 'Search' && !selectedMedia) {
      const interval = setInterval(() => {
        setBannerIndex(i => (i + 1) % currentBanners.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeTab, currentBanners.length, selectedMedia]);

  const displayItem = currentBanners[bannerIndex];

  const backdropUrl = displayItem?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${displayItem.backdrop_path}`
    : '';

  return (
    <div className="relative w-screen h-screen overflow-y-auto overflow-x-hidden bg-black text-white font-sans">
      <style>{`
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      {/* Dynamic Parallax Backdrop */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000 ease-out transform-gpu will-change-transform scale-110 opacity-80 pointer-events-none"
        style={{ 
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          filter: activeTab === 'Search' ? 'blur(20px)' : 'none'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

      {/* Top Shelf Navigation (Desktop) / Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 md:top-0 left-0 right-0 z-50 flex justify-center p-6 md:p-10 pointer-events-none">
        <div className="flex gap-1 md:gap-3 glass p-1.5 md:p-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto border-white/10 w-fit mx-auto">
          {TOP_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button 
                key={item.label}
                onClick={() => {
                  if (item.label === 'Switch Profile') {
                    onSwitchProfile();
                  } else {
                    setActiveTab(item.label);
                    setSearchQuery('');
                    setSelectedGenre(null);
                  }
                }}
                className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all duration-500 transform-gpu will-change-transform cursor-pointer group min-w-[64px] md:min-w-0 ${
                  isActive ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                <Icon size={18} className="md:size-5" />
                <span className="text-[10px] md:text-sm font-semibold tracking-tight">{item.label === 'Switch Profile' ? 'Identity' : item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen flex flex-col pt-32 pb-32">
        {/* Search Tab */}
        {activeTab === 'Search' && (
          <div className="px-6 md:px-24 w-full max-w-7xl mx-auto flex flex-col gap-8 md:gap-14 mt-8 md:mt-16">
            <div className="relative w-full">
              <Search size={22} className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find movies, actors, and series..."
                className="w-full glass-dark text-white text-2xl md:text-5xl pl-16 md:pl-28 pr-8 py-5 md:py-8 rounded-[2rem] transition-all duration-500 outline-none focus:ring-1 focus:ring-white/20 shadow-2xl placeholder:text-white/20 font-display"
                autoFocus
              />
              {selectedGenre && !searchQuery && (
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/20 px-3 md:px-4 py-1 md:py-2 rounded-full">
                  <span className="text-sm md:text-xl">{selectedGenre.name}</span>
                  <button onClick={() => setSelectedGenre(null)} className="hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Search Results */}
            {(searchQuery.trim() || selectedGenre) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-8">
                {searchResults.map((item: Media) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedMedia(item)}
                    className="flex flex-col gap-2 md:gap-3 transition-all duration-300 transform-gpu will-change-transform hover:scale-105 hover:z-50 cursor-pointer group"
                  >
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:ring-4 group-hover:ring-white group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                      {item.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center p-4 text-center">
                          {item.title || item.name}
                        </div>
                      )}
                    </div>
                    <span className="text-center font-medium truncate px-2 text-white/60 group-hover:text-white transition-colors">
                      {item.title || item.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {SEARCH_CATEGORIES.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => setSelectedGenre(cat)}
                    className={`relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 transform-gpu will-change-transform bg-gradient-to-br ${cat.color} hover:scale-105 hover:ring-4 hover:ring-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-pointer group`}
                  >
                    <div className="absolute inset-0 flex items-end p-4 md:p-6 bg-black/20 group-hover:bg-transparent transition-colors">
                      <span className="text-xl md:text-3xl font-bold text-white drop-shadow-md">{cat.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Banners */}
        {activeTab !== 'Search' && displayItem && (
          <div className="relative w-full h-[65vh] md:h-[75vh] flex flex-col justify-end pb-12 md:pb-28 px-6 md:px-24 flex-shrink-0">
            <h1 className="text-4xl md:text-8xl font-display font-bold tracking-tight mb-4 drop-shadow-2xl max-w-4xl leading-[1.1]">
              {displayItem.title || displayItem.name}
            </h1>
            <p className="text-base md:text-2xl text-white/70 line-clamp-2 md:line-clamp-3 drop-shadow-md max-w-3xl mb-10 font-medium">
              {displayItem.overview}
            </p>
            <div className="flex gap-4 md:gap-6">
              <button 
                onClick={() => setSelectedMedia(displayItem)}
                className="flex-1 md:flex-none px-8 md:px-12 py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 bg-white text-black hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] font-bold text-lg md:text-xl cursor-pointer"
              >
                <Play fill="currentColor" size={24} />
                <span>Play Now</span>
              </button>
              <button 
                onClick={() => setSelectedMedia(displayItem)}
                className="flex-1 md:flex-none px-8 md:px-12 py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 glass-dark text-white/90 hover:bg-white/10 hover:scale-105 font-bold text-lg md:text-xl cursor-pointer"
              >
                <Info size={24} />
                <span>Details</span>
              </button>
            </div>

            {/* Indicator Bar */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-3 glass px-4 py-2.5 rounded-full border-white/5">
                {currentBanners.map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setBannerIndex(i)}
                    className={`h-1.5 rounded-full overflow-hidden transition-all duration-700 cursor-pointer hover:bg-white/60 ${
                      i === bannerIndex ? 'w-10 bg-white/20' : 'w-1.5 bg-white/30 hover:bg-white'
                    }`}
                  >
                    {i === bannerIndex && (
                      <div 
                        className="h-full bg-white shadow-[0_0_10px_white]"
                        style={{ animation: 'fillProgress 8s linear forwards' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rows */}
        {activeTab !== 'Search' && (
          <div className="flex flex-col gap-20 w-full">
            {activeTab === 'Home' && (
              <>
                <MediaRow title="Recently Viewed" items={profile.history} onSelect={setSelectedMedia} />
                <MediaRow title="My Favorites" items={profile.favorites} onSelect={setSelectedMedia} />
                <MediaRow title="Trending Across Lux" items={trending} onSelect={setSelectedMedia} large />
                <MediaRow title="Blockbuster Movies" items={movies} onSelect={setSelectedMedia} />
                <MediaRow title="Premium TV Series" items={tv} onSelect={setSelectedMedia} />
              </>
            )}
            {activeTab === 'Movies' && (
              <>
                <MediaRow title="Popular Movies" items={movies} onSelect={setSelectedMedia} large />
                <MediaRow title="Top Rated Movies" items={topRatedMovies} onSelect={setSelectedMedia} />
                <MediaRow title="Trending Movies" items={trending.filter(m => m.media_type === 'movie')} onSelect={setSelectedMedia} />
              </>
            )}
            {activeTab === 'TV Shows' && (
              <>
                <MediaRow title="Popular TV Shows" items={tv} onSelect={setSelectedMedia} large />
                <MediaRow title="Top Rated TV Shows" items={topRatedTv} onSelect={setSelectedMedia} />
                <MediaRow title="Trending TV Shows" items={trending.filter(m => m.media_type === 'tv')} onSelect={setSelectedMedia} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMedia && (
        <DetailsModal 
          media={selectedMedia} 
          profile={profile} 
          updateProfile={updateProfile} 
          onClose={() => setSelectedMedia(null)} 
          onPlay={onPlay} 
        />
      )}
    </div>
  );
}

interface MediaRowProps {
  title: string;
  items: Media[];
  onSelect: (item: Media) => void;
  large?: boolean;
}

function MediaRow({ title, items, onSelect, large }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!items?.length) return null;

  const tileWidth = large ? (window.innerWidth < 768 ? 160 : 260) : (window.innerWidth < 768 ? 130 : 210);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 md:gap-5 w-full group/row relative">
      <h2 className="text-xl md:text-3xl font-display font-semibold pl-6 md:pl-24 text-white/90 tracking-tight">
        {title}
      </h2>
      
      {/* Scroll Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 glass p-5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-500 hover:scale-110 cursor-pointer hidden md:flex items-center justify-center border-white/10 shadow-2xl"
      >
        <ChevronLeft size={32} />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 glass p-5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-500 hover:scale-110 cursor-pointer hidden md:flex items-center justify-center border-white/10 shadow-2xl"
      >
        <ChevronRight size={32} />
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-5 md:gap-8 px-6 md:px-24 pb-10 pt-2 no-scrollbar snap-x scroll-smooth"
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex flex-col gap-3 flex-shrink-0 transition-all duration-500 ease-out transform-gpu hover:scale-105 hover:z-30 cursor-pointer group snap-start"
            style={{ width: tileWidth }}
          >
            <div 
              className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] group-hover:ring-1 group-hover:ring-white/30"
              style={{ aspectRatio: '2/3' }}
            >
              <div className="absolute inset-0 bg-white/5 group-hover:opacity-0 transition-opacity" />
              {item.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                  alt={item.title || item.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full glass flex items-center justify-center p-4 text-center font-display">
                  {item.title || item.name}
                </div>
              )}
            </div>
            <span className="text-center text-sm md:text-base font-semibold truncate px-2 text-white/30 group-hover:text-white/90 transition-all duration-500 tracking-tight">
              {item.title || item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsModal({ media, profile, updateProfile, onClose, onPlay }: any) {
  const isFav = profile.favorites?.some((f: Media) => f.id === media.id);
  const isTV = media.media_type === 'tv' || media.first_air_date;
  
  const [cast, setCast] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  
  const [selectedSeason, setSelectedSeason] = useState<any>(null);

  useEffect(() => {
    fetchCredits(isTV ? 'tv' : 'movie', media.id).then(data => {
      setCast(data?.cast?.slice(0, 8) || []);
    });
    
    if (isTV) {
      fetchById('tv', media.id).then(data => {
        const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];
        setSeasons(validSeasons);
        if (validSeasons.length > 0) {
          setSelectedSeason(validSeasons[0]);
        }
      });
    }
  }, [media, isTV]);

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonDetails(media.id, selectedSeason.season_number).then(data => {
        setEpisodes(data?.episodes || []);
      });
    }
  }, [selectedSeason, media.id]);

  const handlePlay = () => {
    if (isTV && episodes.length > 0) {
      onPlay(media, selectedSeason.season_number, episodes[0].episode_number);
    } else {
      onPlay(media);
    }
  };

  const handlePlayEpisode = (episodeNumber: number) => {
    onPlay(media, selectedSeason.season_number, episodeNumber);
  };

  const toggleFavorite = () => {
    const newFavs = isFav 
      ? profile.favorites.filter((f: Media) => f.id !== media.id)
      : [media, ...(profile.favorites || [])];
    updateProfile({ ...profile, favorites: newFavs });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-safe">
      <button 
        onClick={onClose}
        className="fixed top-6 md:top-10 right-6 md:right-10 z-[110] glass p-4 md:p-5 rounded-full transition-all duration-500 hover:bg-white/20 hover:scale-110 cursor-pointer shadow-2xl border-white/5"
      >
        <X size={28} />
      </button>

      {media.backdrop_path && (
        <div className="absolute top-0 left-0 right-0 h-[50vh] md:h-[70vh] z-0 pointer-events-none">
          <img src={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`} className="w-full h-full object-cover opacity-40 grayscale-[0.3]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      )}
      
      <div className="relative z-10 flex flex-col p-6 md:p-24 pt-20 md:pt-32 min-h-screen">
        <div className="flex-shrink-0 flex flex-col gap-6 md:gap-8 max-w-5xl">
          <h1 className="text-5xl md:text-9xl font-display font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-[0.9]">
            {media.title || media.name}
          </h1>
          <div className="flex gap-4 text-white/40 text-lg md:text-2xl font-bold tracking-tight">
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{isTV ? 'Series' : 'Feature'}</span>
            <span>•</span>
            <span className="text-white/30">TMDB Premium Quality</span>
          </div>
          <p className="text-xl md:text-3xl text-white/50 leading-relaxed font-medium drop-shadow-md line-clamp-4 md:line-clamp-none">
            {media.overview}
          </p>
          
          {cast.length > 0 && (
            <div className="flex gap-4 md:gap-8 mt-6 overflow-x-auto pb-6 no-scrollbar">
              {cast.map(c => (
                <div key={c.id} className="flex flex-col items-center gap-3 md:gap-4 w-24 md:w-32 flex-shrink-0 group/cast">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl overflow-hidden glass border-white/20 flex items-center justify-center shadow-xl transition-all duration-500 group-hover/cast:scale-105 group-hover/cast:ring-4 group-hover/cast:ring-white/10">
                    {c.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${c.profile_path}`} className="w-full h-full object-cover grayscale-[0.2] group-hover/cast:grayscale-0 transition-all duration-500" />
                    ) : (
                      <UserCircle size={40} className="text-white/20" />
                    )}
                  </div>
                  <span className="text-xs md:text-base font-bold text-center text-white/40 group-hover/cast:text-white/80 transition-colors line-clamp-2 leading-tight tracking-tight">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-4 md:gap-8 mt-8 md:mt-10">
            <button 
              onClick={handlePlay}
              className="flex-1 md:flex-none px-10 md:px-16 py-5 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-500 bg-white text-black hover:scale-105 hover:shadow-[0_30px_80px_rgba(255,255,255,0.4)] cursor-pointer"
            >
              <Play fill="currentColor" size={28} />
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">Watch Now</span>
            </button>
            <button 
              onClick={toggleFavorite}
              className="flex-1 md:flex-none px-10 md:px-16 py-5 md:py-6 rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-500 glass hover:bg-white/10 hover:scale-105 shadow-2xl cursor-pointer"
            >
              <Heart fill={isFav ? "white" : "none"} className={isFav ? "text-rose-500 scale-110" : "text-white/60"} size={28} />
              <span className="font-bold text-xl md:text-2xl tracking-tighter uppercase text-white/90">{isFav ? 'In List' : 'Add List'}</span>
            </button>
          </div>
        </div>

        {isTV && seasons.length > 0 && (
          <div className="mt-20 md:mt-32 flex flex-col md:flex-row gap-12 md:gap-20 flex-1">
            {/* Seasons List */}
            <div className="w-full md:w-1/4 flex flex-col gap-6">
              <h3 className="text-3xl md:text-5xl font-display font-black mb-4 md:mb-10 text-white tracking-tighter">Seasons</h3>
              <div className="flex md:flex-col gap-4 md:gap-5 pb-6 md:pb-0 overflow-x-auto md:overflow-x-visible no-scrollbar">
                {seasons.map((season) => (
                  <button 
                    key={season.id}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-6 md:px-10 py-5 md:py-8 rounded-2xl md:rounded-[2rem] text-xl md:text-4xl font-display font-bold transition-all duration-500 text-left cursor-pointer whitespace-nowrap md:whitespace-normal border ${
                      selectedSeason?.id === season.id
                        ? 'bg-white text-black border-white shadow-[0_20px_60px_rgba(255,255,255,0.2)] scale-[1.05]' 
                        : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes List */}
            <div className="w-full md:w-3/4 flex flex-col gap-6">
              <h3 className="text-3xl md:text-5xl font-display font-black mb-4 md:mb-10 text-white tracking-tighter">Episodes</h3>
              <div className="flex flex-col gap-6 md:gap-8 md:pr-4">
                {episodes.map((episode) => (
                  <div 
                    key={episode.id}
                    onClick={() => handlePlayEpisode(episode.episode_number)}
                    className="flex flex-col sm:flex-row gap-6 md:gap-10 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] transition-all duration-500 glass-dark border-white/5 hover:bg-white/10 hover:scale-[1.02] cursor-pointer group shadow-2xl"
                  >
                    <div className="w-full sm:w-56 md:w-96 aspect-video bg-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden flex-shrink-0 shadow-xl relative group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-500">
                      {episode.still_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 font-bold">No Preview</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="glass p-5 rounded-full shadow-2xl">
                          <Play fill="white" size={40} className="drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 pr-4">
                      <h4 className="text-2xl md:text-4xl font-display font-bold mb-2 md:mb-4 truncate text-white/40 group-hover:text-white transition-all duration-500 tracking-tighter">
                        <span className="text-white/10 group-hover:text-white/30 mr-3">{episode.episode_number < 10 ? `0${episode.episode_number}` : episode.episode_number}</span>
                        {episode.name}
                      </h4>
                      <p className="text-lg md:text-2xl line-clamp-2 md:line-clamp-3 text-white/30 group-hover:text-white/60 transition-all duration-500 font-medium leading-relaxed">
                        {episode.overview || 'Synopsis not available for this broadcast.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
