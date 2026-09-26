import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Shield,
  Palette,
  User,
  Sliders,
  X,
  Play,
  Zap,
} from 'lucide-react';
import { WORLD_PRESETS, ART_STYLES } from '../data/presets';
import { StoryEngineModel, ImageSize } from '../types/adventure';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAdventure: (config: {
    genre: string;
    customWorldPrompt: string;
    characterName: string;
    characterClass: string;
    visualDescription: string;
    artStyle: string;
    storyEngineModel: StoryEngineModel;
    imageSize: ImageSize;
  }) => void;
  isStarting: boolean;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartAdventure,
  isStarting,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>('shattered_eclipse');
  const [isCustomWorld, setIsCustomWorld] = useState(false);
  const [customWorldPrompt, setCustomWorldPrompt] = useState('');

  // Character State
  const defaultPreset = WORLD_PRESETS[0];
  const [characterName, setCharacterName] = useState(defaultPreset.defaultCharacter.name);
  const [characterClass, setCharacterClass] = useState(defaultPreset.defaultCharacter.classRole);
  const [visualDescription, setVisualDescription] = useState(
    defaultPreset.defaultCharacter.visualDescription
  );

  // Visual & Model Config
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>(ART_STYLES[0].name);
  const [selectedModel, setSelectedModel] = useState<StoryEngineModel>('gemini-3.1-flash-lite');
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>('1K');

  const handleSelectWorld = (presetId: string) => {
    setSelectedWorldId(presetId);
    setIsCustomWorld(false);
    const preset = WORLD_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCharacterName(preset.defaultCharacter.name);
      setCharacterClass(preset.defaultCharacter.classRole);
      setVisualDescription(preset.defaultCharacter.visualDescription);
      setSelectedArtStyle(preset.artStyle);
    }
  };

  const handleBegin = () => {
    const selectedPreset = WORLD_PRESETS.find((p) => p.id === selectedWorldId);
    onStartAdventure({
      genre: isCustomWorld ? 'Custom World' : selectedPreset?.genre || 'Dark Fantasy',
      customWorldPrompt: isCustomWorld
        ? customWorldPrompt
        : selectedPreset?.description || '',
      characterName: characterName.trim() || 'The Wanderer',
      characterClass: characterClass.trim() || 'Adventurer',
      visualDescription:
        visualDescription.trim() ||
        'Cloaked wanderer with keen silver eyes and runic blade',
      artStyle: selectedArtStyle,
      storyEngineModel: selectedModel,
      imageSize: selectedImageSize,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c1017] border border-amber-800/50 rounded-2xl shadow-2xl p-6 my-8 space-y-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-950/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400 flex items-center justify-center text-amber-100 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-100">
                Begin A New Infinite Odyssey
              </h2>
              <p className="text-xs text-amber-300/70">
                Shape your world, anchor your hero's appearance, and choose your art style
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. WORLD SELECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Step 1: Choose World Domain
            </label>
            <button
              onClick={() => setIsCustomWorld(!isCustomWorld)}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              {isCustomWorld ? 'Use Curated Preset' : '+ Create Custom World'}
            </button>
          </div>

          {isCustomWorld ? (
            <div className="space-y-2">
              <textarea
                value={customWorldPrompt}
                onChange={(e) => setCustomWorldPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your custom universe (e.g. 'A sunken gothic steampunk metropolis where mechanical sea serpents guard forgotten submarine archives...')"
                className="w-full p-3 bg-slate-950 border border-amber-600/50 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WORLD_PRESETS.map((preset) => {
                const isSelected = selectedWorldId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectWorld(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-cinzel text-xs font-bold text-amber-200">
                        {preset.title}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {preset.genre.split('&')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. CHARACTER ANCHOR (Crucial for consistent art generation) */}
        <div className="space-y-3 pt-2 border-t border-amber-950/50">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Step 2: Character Identity & Visual Anchor
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Character Name</span>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Valen Drake"
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Class / Archetype</span>
              <input
                type="text"
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                placeholder="e.g. Cursed Spellblade"
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-300 font-medium">
                Visual Consistency Description (Embedded into Every Scene Generation)
              </span>
              <span className="text-[10px] text-amber-400/80">Keeps facial & gear features identical</span>
            </div>
            <textarea
              value={visualDescription}
              onChange={(e) => setVisualDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Silver-haired rogue, runic facial scar on left cheek, charcoal leather mantle with glowing amethyst sword"
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* 3. ART STYLE & ENGINE SPEED */}
        <div className="space-y-3 pt-2 border-t border-amber-950/50">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Step 3: Visual Style & Story Engine Model
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Illustration Art Style</span>
              <select
                value={selectedArtStyle}
                onChange={(e) => setSelectedArtStyle(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
              >
                {ART_STYLES.map((style) => (
                  <option key={style.id} value={style.name}>
                    {style.name} ({style.badge})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                Story Engine Speed (Gemini Model)
              </span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as StoryEngineModel)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
              >
                <option value="gemini-3.1-flash-lite">⚡ Gemini 3.1 Flash Lite (Low-Latency)</option>
                <option value="gemini-3.5-flash">⚖️ Gemini 3.5 Flash (Balanced Narrative)</option>
                <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro (Deep Complex Reasoning)</option>
              </select>
            </div>
          </div>

          {/* Image Size Affordance */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-slate-200">Gemini 3 Pro Image Resolution:</span>
                <span className="text-slate-500 text-[11px] ml-1">affordance for user specification</span>
              </div>
            </div>

            <div className="flex gap-1.5 font-mono">
              {(['1K', '2K', '4K'] as ImageSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedImageSize(sz)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedImageSize === sz
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-950/60">
          <button
            onClick={onClose}
            disabled={isStarting}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBegin}
            disabled={isStarting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Weaving Opening World...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Begin Adventure</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
