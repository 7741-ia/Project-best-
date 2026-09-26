import React from 'react';
import { Heart, Brain, Coins, MapPin, ShieldAlert, Award } from 'lucide-react';
import { Character } from '../types/adventure';

interface StatsBarProps {
  character: Character;
  location: string;
  dangerLevel: string;
  turnNumber: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  character,
  location,
  dangerLevel,
  turnNumber,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (character.health / character.maxHealth) * 100));
  const sanityPercent = Math.max(0, Math.min(100, character.sanity));

  const getDangerBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'deadly':
        return {
          bg: 'bg-red-950/80 border-red-600 text-red-300',
          pulse: true,
          label: 'Deadly Peril',
        };
      case 'perilous':
        return {
          bg: 'bg-orange-950/80 border-orange-500 text-orange-300',
          pulse: false,
          label: 'Perilous',
        };
      case 'tense':
        return {
          bg: 'bg-amber-950/80 border-amber-500/80 text-amber-300',
          pulse: false,
          label: 'Tense',
        };
      default:
        return {
          bg: 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300',
          pulse: false,
          label: 'Safe Haven',
        };
    }
  };

  const dangerStyle = getDangerBadge(dangerLevel);

  return (
    <div className="bg-[#0f131c]/95 border-b border-amber-950/50 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Character Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 border border-amber-400/60 flex items-center justify-center font-cinzel font-bold text-amber-100 shadow-sm">
              {character.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span>{character.name}</span>
                <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.2 bg-amber-950/60 border border-amber-800/60 rounded">
                  Lv.{character.level || 1} {character.classRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meters (HP, Sanity, Gold) */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-0.5">
                <span>HP</span>
                <span>
                  {character.health}/{character.maxHealth}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500 rounded-full"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sanity / Resolve */}
          <div className="flex items-center gap-1.5 min-w-[110px]">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-0.5">
                <span>Sanity</span>
                <span>{character.sanity}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${sanityPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold Pouch */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{character.gold}</span>
            <span className="text-[10px] text-amber-500/80">gold</span>
          </div>
        </div>

        {/* Location, Danger & Turn */}
        <div className="flex items-center gap-2.5">
          {/* Location */}
          <div className="flex items-center gap-1 text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 max-w-[190px] truncate" title={location}>
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{location || 'The Unknown Wilds'}</span>
          </div>

          {/* Danger Level */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${
              dangerStyle.bg
            } ${dangerStyle.pulse ? 'animate-pulse' : ''}`}
          >
            <ShieldAlert className="w-3 h-3 shrink-0" />
            <span>{dangerStyle.label}</span>
          </div>

          {/* Turn Counter */}
          <div className="flex items-center gap-1 text-slate-400 font-mono bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Turn {turnNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
