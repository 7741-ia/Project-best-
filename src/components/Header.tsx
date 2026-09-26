import React from 'react';
import {
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  PlusCircle,
  Download,
  Upload,
  Zap,
  Sliders,
} from 'lucide-react';
import { StoryEngineModel, ImageSize } from '../types/adventure';

interface HeaderProps {
  storyEngineModel: StoryEngineModel;
  onSelectStoryModel: (model: StoryEngineModel) => void;
  imageSize: ImageSize;
  onSelectImageSize: (size: ImageSize) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenChronicles: () => void;
  onOpenNewGame: () => void;
  onExportGame: () => void;
  onImportGame: () => void;
  onToggleCompanion: () => void;
  isCompanionOpen: boolean;
  unreadCompanionCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  storyEngineModel,
  onSelectStoryModel,
  imageSize,
  onSelectImageSize,
  soundEnabled,
  onToggleSound,
  onOpenChronicles,
  onOpenNewGame,
  onExportGame,
  onImportGame,
  onToggleCompanion,
  isCompanionOpen,
  unreadCompanionCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-amber-900/40 bg-[#0b0e14]/90 backdrop-blur-md px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Compass className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-wider text-amber-100 flex items-center gap-1.5">
                AETHERIA
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
                Infinite CYOA
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-amber-200/60 font-medium">
              Non-linear story engine with consistent AI illustration & dynamic tracking
            </p>
          </div>
        </div>

        {/* Story Controls & Affordances */}
        <div className="flex items-center gap-2">
          {/* Story Model Selector (Low-Latency Highlighted) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Engine:
            </span>
            <button
              onClick={() => onSelectStoryModel('gemini-3.1-flash-lite')}
              title="Fastest turns with Gemini 3.1 Flash Lite"
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                storyEngineModel === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              ⚡ Flash Lite (Low-Latency)
            </button>
            <button
              onClick={() => onSelectStoryModel('gemini-3.5-flash')}
              title="Balanced rich narrative with Gemini 3.5 Flash"
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                storyEngineModel === 'gemini-3.5-flash'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              3.5 Flash
            </button>
            <button
              onClick={() => onSelectStoryModel('gemini-3.1-pro-preview')}
              title="Deep complex reasoning with Gemini 3.1 Pro Preview"
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                storyEngineModel === 'gemini-3.1-pro-preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              3.1 Pro
            </button>
          </div>

          {/* Image Size Affordance Quick Toggle (1K, 2K, 4K) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-lg p-1" title="Resolution for Gemini 3 Pro Image generation">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              Art Size:
            </span>
            {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
              <button
                key={size}
                onClick={() => onSelectImageSize(size)}
                className={`px-2 py-0.5 text-xs rounded font-mono font-medium transition-all ${
                  imageSize === size
                    ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute ambient sound effects' : 'Enable ambient sound effects'}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Chronicles Log */}
          <button
            onClick={onOpenChronicles}
            title="Open Adventure Chronicles & History"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-amber-300 hover:border-amber-600/50 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Chronicles</span>
          </button>

          {/* Save/Export */}
          <button
            onClick={onExportGame}
            title="Export / Download Adventure Savefile"
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Load/Import */}
          <button
            onClick={onImportGame}
            title="Import / Restore Adventure Savefile"
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Gemini Companion Chat Toggle Button */}
          <button
            onClick={onToggleCompanion}
            title="Toggle Gemini Oracle & Companion Chatbot"
            className={`relative px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-2 border transition-all ${
              isCompanionOpen
                ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/90 border-purple-500/30 text-purple-300 hover:bg-purple-950/40 hover:border-purple-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="font-semibold">DM Companion</span>
            {unreadCompanionCount > 0 && !isCompanionOpen && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </button>

          {/* New Game Button */}
          <button
            onClick={onOpenNewGame}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">New World</span>
          </button>
        </div>
      </div>
    </header>
  );
};
