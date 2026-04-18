import { useState } from 'react';
import { Profile, Media } from './types';
import { ProfileScreen } from './components/ProfileScreen';
import { MainScreen } from './components/MainScreen';
import { Player } from './components/Player';

type AppState = 'PROFILES' | 'MAIN' | 'PLAYER';

export default function App() {
  const [appState, setAppState] = useState<AppState>('PROFILES');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [playingItem, setPlayingItem] = useState<{item: Media, season?: number, episode?: number} | null>(null);

  const updateProfile = (updated: Profile) => {
    const stored = JSON.parse(localStorage.getItem('app_profiles') || '[]');
    const newProfiles = stored.map((p: Profile) => p.id === updated.id ? updated : p);
    localStorage.setItem('app_profiles', JSON.stringify(newProfiles));
    setActiveProfile(updated);
  };

  const handleSelectProfile = (profile: Profile) => {
    // Ensure legacy profiles have history and favorites arrays
    const updatedProfile = {
      ...profile,
      history: Array.isArray(profile.history) ? profile.history : [],
      favorites: Array.isArray(profile.favorites) ? profile.favorites : []
    };
    setActiveProfile(updatedProfile);
    setAppState('MAIN');
  };

  const handlePlay = (item: Media, season?: number, episode?: number) => {
    if (activeProfile) {
      const newHistory = [item, ...activeProfile.history.filter(i => i.id !== item.id)].slice(0, 20);
      updateProfile({ ...activeProfile, history: newHistory });
    }
    setPlayingItem({ item, season, episode });
    setAppState('PLAYER');
  };

  const handleClosePlayer = () => {
    setPlayingItem(null);
    setAppState('MAIN');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none">
      {appState === 'PROFILES' && (
        <ProfileScreen onSelectProfile={handleSelectProfile} />
      )}
      {appState === 'MAIN' && activeProfile && (
        <MainScreen 
          profile={activeProfile} 
          updateProfile={updateProfile} 
          onPlay={handlePlay} 
          onSwitchProfile={() => setAppState('PROFILES')}
        />
      )}
      {appState === 'PLAYER' && playingItem && (
        <Player 
          item={playingItem.item} 
          season={playingItem.season} 
          episode={playingItem.episode} 
          onClose={handleClosePlayer} 
        />
      )}
    </div>
  );
}
