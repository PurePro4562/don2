import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const COLORS = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];

export function ProfileScreen({ onSelectProfile }: { onSelectProfile: (p: Profile) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('app_profiles');
    if (stored) {
      setProfiles(JSON.parse(stored));
    } else {
      const defaultProfiles = [{ id: '1', name: 'John', color: 'bg-blue-500', history: [], favorites: [] }];
      setProfiles(defaultProfiles);
      localStorage.setItem('app_profiles', JSON.stringify(defaultProfiles));
    }
  }, []);

  const handleDeleteProfile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (profiles.length > 1) {
      const updated = profiles.filter((_, i) => i !== index);
      setProfiles(updated);
      localStorage.setItem('app_profiles', JSON.stringify(updated));
    }
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const newProfile: Profile = {
        id: Date.now().toString(),
        name: newName.trim(),
        color: COLORS[profiles.length % COLORS.length],
        history: [],
        favorites: []
      };
      const updated = [...profiles, newProfile];
      setProfiles(updated);
      localStorage.setItem('app_profiles', JSON.stringify(updated));
      setIsAdding(false);
      setNewName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900 flex flex-col items-center justify-center text-white font-sans overflow-y-auto pb-safe pt-safe">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
      
      <div className="z-10 flex flex-col items-center px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-light mb-8 md:mb-16 tracking-tight">Who's Watching?</h1>
        
        <div className="flex gap-6 md:gap-8 items-center flex-wrap justify-center max-w-5xl">
          {profiles.map((p, i) => (
            <div key={p.id} className="flex flex-col items-center gap-2 md:gap-4 group relative cursor-pointer" onClick={() => onSelectProfile(p)}>
              <div
                className={`w-24 h-24 md:w-40 md:h-40 rounded-full flex items-center justify-center text-3xl md:text-5xl font-medium transition-all duration-300 transform-gpu will-change-transform ${p.color} group-hover:scale-110 group-hover:ring-4 group-hover:ring-white group-hover:shadow-2xl opacity-80 group-hover:opacity-100`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-base md:text-xl transition-opacity duration-300 opacity-60 group-hover:opacity-100">
                {p.name}
              </span>
              {profiles.length > 1 && (
                <button 
                  onClick={(e) => handleDeleteProfile(e, i)}
                  className="absolute -top-1 -right-1 bg-red-500 p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg"
                  title="Delete Profile"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <div className="flex flex-col items-center gap-2 md:gap-4 group cursor-pointer" onClick={() => setIsAdding(true)}>
            <div
              className="w-24 h-24 md:w-40 md:h-40 rounded-full flex items-center justify-center bg-neutral-800 transition-all duration-300 transform-gpu will-change-transform group-hover:scale-110 group-hover:ring-4 group-hover:ring-white group-hover:shadow-2xl opacity-80 group-hover:opacity-100"
            >
              <Plus size={32} className="md:w-12 md:h-12" />
            </div>
            <span className="text-base md:text-xl transition-opacity duration-300 opacity-60 group-hover:opacity-100">
              Add Profile
            </span>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4">
          <form onSubmit={handleAddProfile} className="w-full max-w-sm flex flex-col items-center gap-6 md:gap-8 bg-neutral-900 p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-light">New Profile</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name..."
              className="w-full bg-white/10 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl text-xl md:text-3xl text-center border border-white/20 outline-none focus:border-white/50 focus:bg-white/20 transition-all"
              autoFocus
            />
            <div className="flex gap-4 w-full">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 md:px-8 py-2 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-lg md:text-xl font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!newName.trim()}
                className="flex-1 px-4 md:px-8 py-2 md:py-3 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors text-lg md:text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
