import React from 'react';
import { BookOpen, X, MapPin, Award, Sparkles, ChevronRight } from 'lucide-react';
import { StoryTurn } from '../types/adventure';

interface ChroniclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  turns: StoryTurn[];
  characterName: string;
}

export const ChroniclesModal: React.FC<ChroniclesModalProps> = ({
  isOpen,
  onClose,
  turns,
  characterName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c1017] border border-amber-800/60 rounded-2xl shadow-2xl p-6 my-8 space-y-5 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-950/70 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-100">
                The Chronicles of {characterName}
              </h2>
              <p className="text-xs text-amber-300/70">
                Timeline of choices, branching encounters, and captured scene illustrations
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

        {/* Turn Timeline List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {turns.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">The pages of your chronicle are not yet penned.</p>
            </div>
          ) : (
            turns.map((turn, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-xs font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-700/50">
                      Chapter {turn.turnNumber}
                    </span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {turn.location}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {turn.timestamp || 'Recorded in memory'}
                  </span>
                </div>

                {/* Choice Made */}
                {turn.userChoice && (
                  <div className="text-xs text-amber-200 bg-slate-950/70 p-2.5 rounded-lg border border-amber-950/60 flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider font-semibold">
                        Action Taken:
                      </span>
                      <span>"{turn.userChoice}"</span>
                    </div>
                  </div>
                )}

                {/* Scene Artwork thumbnail if present */}
                {turn.sceneImageUrl && (
                  <div className="relative w-full max-h-48 rounded-lg overflow-hidden border border-slate-700/70">
                    <img
                      src={turn.sceneImageUrl}
                      alt={`Chapter ${turn.turnNumber}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover object-center"
                    />
                    <div className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {turn.imageSizeUsed || '1K'}
                    </div>
                  </div>
                )}

                {/* Summary or excerpt */}
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {turn.summary || turn.storyText.slice(0, 220) + '...'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Chronicles
          </button>
        </div>
      </div>
    </div>
  );
};
