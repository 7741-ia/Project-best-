import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Send,
  Sliders,
  ShieldAlert,
  Sword,
  MessageSquare,
  Eye,
  Wand2,
  Flame,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import { Choice, StoryTurn, ImageSize, ImageModel } from '../types/adventure';

interface StoryViewerProps {
  currentTurn: StoryTurn | null;
  choices: Choice[];
  onSelectChoice: (choiceText: string) => void;
  isLoading: boolean;
  onGenerateImage: (size?: ImageSize) => void;
  isGeneratingImage: boolean;
  selectedImageSize: ImageSize;
  onSelectImageSize: (size: ImageSize) => void;
  autoGenerateImage: boolean;
  onToggleAutoGenerateImage: (val: boolean) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  currentTurn,
  choices,
  onSelectChoice,
  isLoading,
  onGenerateImage,
  isGeneratingImage,
  selectedImageSize,
  onSelectImageSize,
  autoGenerateImage,
  onToggleAutoGenerateImage,
}) => {
  const [customAction, setCustomAction] = useState('');
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quick Action presets
  const quickActions = [
    'Cautiously inspect surroundings for traps or hidden relics',
    'Ready weapons and prepare for ambush',
    'Attempt to communicate and negotiate',
    'Cast an arcane detection ward',
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading) return;
    onSelectChoice(customAction.trim());
    setCustomAction('');
  };

  const getChoiceBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'combat':
        return {
          icon: <Sword className="w-3.5 h-3.5 text-rose-400" />,
          border: 'border-rose-900/60 hover:border-rose-500 bg-rose-950/20',
          badge: 'Combat Action',
          badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
        };
      case 'stealth':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-indigo-400" />,
          border: 'border-indigo-900/60 hover:border-indigo-500 bg-indigo-950/20',
          badge: 'Stealth / Infiltrate',
          badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
        };
      case 'dialogue':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-sky-400" />,
          border: 'border-sky-900/60 hover:border-sky-500 bg-sky-950/20',
          badge: 'Dialogue / Parley',
          badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
        };
      case 'magic':
        return {
          icon: <Wand2 className="w-3.5 h-3.5 text-purple-400" />,
          border: 'border-purple-900/60 hover:border-purple-500 bg-purple-950/20',
          badge: 'Arcane Spells',
          badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
        };
      case 'risky':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          border: 'border-amber-900/60 hover:border-amber-500 bg-amber-950/20',
          badge: 'High Risk Gambit',
          badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
        };
      default:
        return {
          icon: <Flame className="w-3.5 h-3.5 text-emerald-400" />,
          border: 'border-slate-800 hover:border-amber-500/80 bg-slate-900/40',
          badge: 'Exploration',
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        };
    }
  };

  // Text-to-speech narration
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (currentTurn?.storyText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentTurn.storyText);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 space-y-6 max-w-5xl mx-auto">
      {/* 1. SCENE ARTWORK SECTION */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-900/40 bg-slate-950/90 shadow-2xl">
        {/* Image Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#0c1017]/95 border-b border-amber-950/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Scene Illustration</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700 font-mono">
              gemini-3-pro-image-preview
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Resolution Affordance (1K, 2K, 4K) as explicitly mandated */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold px-1 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                Res:
              </span>
              {(['1K', '2K', '4K'] as ImageSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onSelectImageSize(sz)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    selectedImageSize === sz
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Auto Generate Toggle */}
            <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoGenerateImage}
                onChange={(e) => onToggleAutoGenerateImage(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
              />
              <span className="hidden md:inline">Auto-generate</span>
            </label>

            {/* Regenerate Button */}
            <button
              onClick={() => onGenerateImage(selectedImageSize)}
              disabled={isGeneratingImage || isLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              <span>{currentTurn?.sceneImageUrl ? 'Regenerate' : 'Generate Art'}</span>
            </button>

            {/* Fullscreen view */}
            {currentTurn?.sceneImageUrl && (
              <button
                onClick={() => setIsFullscreenImage(!isFullscreenImage)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
                title="Fullscreen Image"
              >
                {isFullscreenImage ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Image Content Frame */}
        <div className="relative w-full aspect-21/9 sm:aspect-16/9 bg-radial from-slate-900 to-[#07090e] flex items-center justify-center overflow-hidden">
          {isGeneratingImage ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-xs text-amber-200 font-medium">
                Weaving consistent visual scene with Gemini 3 Pro ({selectedImageSize})...
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Anchoring character features and lighting atmosphere for continuous visual continuity.
              </p>
            </div>
          ) : currentTurn?.sceneImageUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={currentTurn.sceneImageUrl}
                alt="Adventure Scene"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-medium bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
                  {currentTurn.location}
                </span>
                <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-white/10 font-mono">
                  {currentTurn.imageSizeUsed || selectedImageSize} • Consistent Style Anchor
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Sparkles className="w-10 h-10 mb-2 text-amber-600/40" />
              <p className="text-xs font-medium text-slate-400">Scene image not rendered yet</p>
              <button
                onClick={() => onGenerateImage(selectedImageSize)}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Click to generate artwork in {selectedImageSize} resolution
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal Image */}
      {isFullscreenImage && currentTurn?.sceneImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreenImage(false)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={currentTurn.sceneImageUrl}
              alt="High-Res Scene"
              referrerPolicy="no-referrer"
              className="max-h-[82vh] w-auto rounded-xl object-contain border border-amber-500/40 shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-400 px-4">
              <span>{currentTurn.location}</span>
              <span className="text-amber-300">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. NARRATIVE PARCHMENT READER */}
      <div className="rounded-2xl border border-amber-900/40 bg-[#0d111a]/90 backdrop-blur-md p-5 sm:p-7 shadow-xl space-y-4 parchment-glow">
        {/* Narrative Header */}
        <div className="flex items-center justify-between border-b border-amber-950/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400/90 font-bold">
              Turn {currentTurn?.turnNumber || 1} • {currentTurn?.location || 'Unknown Passage'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Speech Narration */}
            <button
              onClick={handleToggleSpeech}
              title={isSpeaking ? 'Stop Narration' : 'Narrate Story with Voice'}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">
                {isSpeaking ? 'Mute' : 'Listen'}
              </span>
            </button>
          </div>
        </div>

        {/* Status Delta Toast / Notification Banner */}
        {currentTurn?.statusLog && (
          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-700/40 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{currentTurn.statusLog}</span>
          </div>
        )}

        {/* Story Text Body */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="font-cinzel text-sm text-amber-200">
              The threads of fate are intertwining...
            </p>
            <p className="text-xs text-slate-500">
              Calculating true consequences and branching the storyline.
            </p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed font-sans text-sm sm:text-base space-y-3 font-light">
            {(currentTurn?.storyText || 'The mists swirl in the silence...').split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx} className="text-slate-200/95 leading-relaxed tracking-wide">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 3. DYNAMIC BRANCHING CHOICES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-cinzel text-sm font-bold tracking-wider text-amber-200 uppercase">
              Choose Your Action
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Every choice irreversibly alters the plot
          </span>
        </div>

        {/* Pre-Generated Contextual Choices */}
        <div className="grid grid-cols-1 gap-2.5">
          {choices.map((choice) => {
            const badge = getChoiceBadge(choice.type);
            return (
              <button
                key={choice.id}
                onClick={() => onSelectChoice(choice.text)}
                disabled={isLoading}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group relative hover:scale-[1.008] active:scale-[0.99] disabled:opacity-50 cursor-pointer ${badge.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded bg-black/40 border border-white/10 shrink-0">
                      {badge.icon}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-100 group-hover:text-amber-200 transition-colors">
                        {choice.text}
                      </p>
                      {choice.hint && (
                        <p className="text-[11px] text-slate-400 mt-1 italic group-hover:text-slate-300">
                          {choice.hint}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold shrink-0 ${badge.badgeColor}`}
                  >
                    {badge.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. SANDBOX CUSTOM ACTION INPUT ("Genuinely alter upcoming plot") */}
        <div className="mt-4 p-4 rounded-xl border border-amber-900/50 bg-[#0e121a]/95 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Forge a Custom Action (Infinite Sandbox Agency)
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Type anything you want to do, say, cast, or build
            </span>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. 'I inspect the runes on the altar and speak an ancient phrase in a whisper...'"
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!customAction.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>Act</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 self-center mr-1">Quick Actions:</span>
            {quickActions.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCustomAction(qa)}
                disabled={isLoading}
                className="text-[10px] px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700 transition-colors"
              >
                {qa}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
