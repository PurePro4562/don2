import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { Plus, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-rose-500 to-pink-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-violet-500 to-purple-500',
  'bg-gradient-to-br from-amber-500 to-orange-500'
];

export function ProfileScreen({ onSelectProfile }: { onSelectProfile: (p: Profile) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('app_profiles');
    if (stored) {
      setProfiles(JSON.parse(stored));
    } else {
      const defaultProfiles = [{ id: '1', name: 'Viewer', color: COLORS[0], history: [], favorites: [] }];
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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white font-sans overflow-hidden pb-safe pt-safe">
      <div className="absolute inset-0 liquid-mesh opacity-50 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center px-6 text-center w-full max-w-6xl"
      >
        <h1 className="text-4xl md:text-6xl font-display font-semibold mb-12 md:mb-20 tracking-tight">
          Lux Cinema
        </h1>
        
        <div className="flex gap-8 md:gap-12 items-center flex-wrap justify-center">
          <AnimatePresence mode="popLayout">
            {profiles.map((p, i) => (
              <motion.div 
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSelectProfile(p)}
                className="flex flex-col items-center gap-4 group relative cursor-pointer"
              >
                <div
                  className={`w-28 h-28 md:w-44 md:h-44 rounded-3xl flex items-center justify-center text-4xl md:text-6xl font-display font-bold transition-all duration-500 transform-gpu will-change-transform ${p.color} border border-white/20 shadow-xl group-hover:scale-105 group-hover:ring-8 group-hover:ring-white/10 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
                >
                  <span className="drop-shadow-lg">{p.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-lg md:text-2xl font-medium transition-all duration-300 text-white/50 group-hover:text-white">
                  {p.name}
                </span>
                
                {profiles.length > 1 && (
                  <button 
                    onClick={(e) => handleDeleteProfile(e, i)}
                    className="absolute -top-3 -right-3 glass p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500/80 shadow-lg text-white/80 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            layout
            key="add-profile"
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center gap-4 group cursor-pointer"
          >
            <div
              className="w-28 h-28 md:w-44 md:h-44 rounded-3xl flex items-center justify-center glass transition-all duration-500 transform-gpu will-change-transform group-hover:scale-105 group-hover:bg-white/10 group-hover:ring-8 group-hover:ring-white/5"
            >
              <Plus size={32} className="md:w-16 md:h-16 text-white/30 group-hover:text-white/80 transition-colors" />
            </div>
            <span className="text-lg md:text-2xl font-medium transition-all duration-300 text-white/30 group-hover:text-white/60">
              Add
            </span>
          </motion.div>
        </div>
      </motion.div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-3xl px-4">
          <motion.form 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleAddProfile} 
            className="w-full max-w-sm flex flex-col items-center gap-8 glass p-10 md:p-14 rounded-[2.5rem] shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-display font-medium">New Profile</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Who is this?"
              className="w-full bg-white/5 text-white px-8 py-4 rounded-2xl text-xl md:text-2xl text-center border border-white/10 outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/10 transition-all placeholder:text-white/20"
              autoFocus
            />
            <div className="flex gap-4 w-full">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-6 py-4 rounded-2xl glass hover:bg-white/10 transition-colors text-lg font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!newName.trim()}
                className="flex-1 px-6 py-4 rounded-2xl bg-white text-black hover:bg-gray-100 transition-colors text-lg font-bold disabled:opacity-40"
              >
                Join
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
