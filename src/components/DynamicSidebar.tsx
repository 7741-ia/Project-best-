import React, { useState } from 'react';
import {
  Package,
  Scroll,
  Users,
  CheckCircle2,
  CircleDot,
  Sparkles,
  ChevronRight,
  Info,
  Shield,
  Sword,
  FlaskConical,
  Wrench,
  Book,
  Eye,
  X,
  Palette,
} from 'lucide-react';
import { InventoryItem, QuestState, NPC } from '../types/adventure';

interface DynamicSidebarProps {
  inventory: InventoryItem[];
  questState: QuestState;
  npcs: NPC[];
  visualAnchor: string;
  artStyle: string;
  onUpdateVisualAnchor?: (newAnchor: string) => void;
  onUseItem?: (item: InventoryItem) => void;
  inventoryHighlight?: boolean;
  questHighlight?: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  inventory,
  questState,
  npcs,
  visualAnchor,
  artStyle,
  onUpdateVisualAnchor,
  onUseItem,
  inventoryHighlight = false,
  questHighlight = false,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'quest' | 'npcs' | 'visuals'>('inventory');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingVisual, setEditingVisual] = useState(false);
  const [customVisualInput, setCustomVisualInput] = useState(visualAnchor);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'weapon':
        return <Sword className="w-3.5 h-3.5 text-rose-400" />;
      case 'armor':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'potion':
        return <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />;
      case 'tool':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
      case 'relic':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Book className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Rarity styling
  const getRarityBadge = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'border-amber-500/70 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'epic':
        return 'border-purple-500/70 bg-purple-950/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'rare':
        return 'border-sky-500/70 bg-sky-950/40 text-sky-300';
      case 'uncommon':
        return 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300';
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-300';
    }
  };

  const getRelationshipColor = (rel: string) => {
    switch (rel?.toLowerCase()) {
      case 'ally':
        return 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300';
      case 'rival':
        return 'bg-amber-950/70 border-amber-600/70 text-amber-300';
      case 'enemy':
        return 'bg-rose-950/70 border-rose-600/70 text-rose-300';
      default:
        return 'bg-slate-900/70 border-slate-700 text-slate-300';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-full lg:h-[calc(100vh-100px)] w-84 sm:w-96 bg-[#0c1017] border-l border-amber-900/40 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header & Tab Navigation */}
        <div className="p-3 border-b border-amber-950/70 bg-slate-950/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="font-cinzel text-sm font-bold tracking-wider text-amber-200 uppercase">
                Adventure Ledger
              </h2>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`relative py-1.5 px-1 rounded text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'inventory'
                  ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Package className="w-4 h-4" />
                {inventoryHighlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px]">Pouch ({inventory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('quest')}
              className={`relative py-1.5 px-1 rounded text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'quest'
                  ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Scroll className="w-4 h-4" />
                {questHighlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px]">Quests</span>
            </button>

            <button
              onClick={() => setActiveTab('npcs')}
              className={`py-1.5 px-1 rounded text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'npcs'
                  ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px]">Folks ({npcs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('visuals')}
              className={`py-1.5 px-1 rounded text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === 'visuals'
                  ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10px]">Art Anchor</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* TAB 1: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Carried Gear & Treasures
                </span>
                <span className="text-[11px] font-mono text-amber-400/80">
                  {inventory.reduce((sum, item) => sum + (item.quantity || 1), 0)} items total
                </span>
              </div>

              {inventory.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="text-xs">Your satchel is empty.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Explore ruins and slay foes to discover relics and supplies.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-black/40 border border-white/10 shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                                  x{item.quantity}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {item.rarity} {item.category}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-1" />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 pl-7">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CURRENT QUEST */}
          {activeTab === 'quest' && (
            <div className="space-y-4">
              {/* Main Quest Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900/80 border border-amber-700/50 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                    Main Quest
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="font-cinzel text-sm font-bold text-amber-100">
                  {questState.title || 'The Journey Unfolds'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {questState.summary}
                </p>

                {/* Immediate Objective */}
                <div className="pt-2 border-t border-amber-900/30">
                  <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-wider block mb-1">
                    Current Objective
                  </span>
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-amber-500/30">
                    <CircleDot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-xs font-medium text-amber-200">
                      {questState.currentObjective || 'Explore the surroundings and find a path forward.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestones Completed */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Completed Milestones
                </span>
                {(!questState.milestonesCompleted || questState.milestonesCompleted.length === 0) ? (
                  <p className="text-[11px] text-slate-500 italic pl-1">
                    No milestones accomplished yet. The road is fresh.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {questState.milestonesCompleted.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="line-through text-slate-400">{milestone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Quests */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Side Quests ({questState.sideQuests?.length || 0})
                </span>
                {(!questState.sideQuests || questState.sideQuests.length === 0) ? (
                  <p className="text-[11px] text-slate-500 italic pl-1">
                    No active side quests discovered.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {questState.sideQuests.map((sq) => (
                      <div
                        key={sq.id}
                        className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-slate-200">{sq.title}</h4>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              sq.status === 'Completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                            }`}
                          >
                            {sq.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{sq.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NPCS & COMPANIONS */}
          {activeTab === 'npcs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Dramatis Personae
                </span>
                <span className="text-[11px] text-slate-500">
                  {npcs.length} souls encountered
                </span>
              </div>

              {npcs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="text-xs">No notable companions or foes recorded.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    As you interact with characters in the narrative, their allegiance will be logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {npcs.map((npc) => (
                    <div
                      key={npc.id}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-200">{npc.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getRelationshipColor(
                            npc.relationship
                          )}`}
                        >
                          {npc.relationship}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {npc.description}
                      </p>
                      {npc.status && (
                        <div className="text-[10px] text-amber-400/80 font-mono bg-slate-950/60 p-1 rounded border border-slate-800/80">
                          Status: {npc.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VISUAL ANCHOR & CONSISTENT ART STYLE */}
          {activeTab === 'visuals' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Artistic Consistency System
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To prevent the AI from generating random faces or shifting art styles, every real-time scene image is anchored to your visual signature.
                </p>
              </div>

              {/* Art Style Card */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">Chosen Art Style</span>
                <div className="text-xs font-bold text-amber-300 font-cinzel">{artStyle}</div>
              </div>

              {/* Character Visual Anchor */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Character Visual Anchor
                  </span>
                  <button
                    onClick={() => {
                      if (editingVisual && onUpdateVisualAnchor) {
                        onUpdateVisualAnchor(customVisualInput);
                      }
                      setEditingVisual(!editingVisual);
                    }}
                    className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline"
                  >
                    {editingVisual ? 'Save Anchor' : 'Edit Anchor'}
                  </button>
                </div>

                {editingVisual ? (
                  <div className="space-y-2">
                    <textarea
                      value={customVisualInput}
                      onChange={(e) => setCustomVisualInput(e.target.value)}
                      rows={4}
                      className="w-full p-2 bg-slate-950 border border-amber-600/50 rounded text-xs text-slate-200 focus:outline-hidden"
                      placeholder="Character visual anchor (hair, scars, armor, distinct weapons)..."
                    />
                    <p className="text-[10px] text-slate-500">
                      Modifying this will alter how the AI paints your character in upcoming scenes.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 italic bg-black/30 p-2.5 rounded border border-slate-800/80">
                    "{visualAnchor}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Item Inspect / Action Modal */}
        {selectedItem && (
          <div className="p-3 border-t border-amber-950/80 bg-slate-950">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-black/60 border border-white/10">
                  {getCategoryIcon(selectedItem.category)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{selectedItem.name}</h4>
                  <span className="text-[10px] text-amber-400 capitalize">
                    {selectedItem.rarity} {selectedItem.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 bg-slate-900/80 p-2 rounded border border-slate-800">
              {selectedItem.description}
            </p>

            <div className="flex gap-2">
              {onUseItem && (
                <button
                  onClick={() => {
                    onUseItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-1.5 px-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Use / Action in Story
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
