import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { StoryViewer } from './components/StoryViewer';
import { DynamicSidebar } from './components/DynamicSidebar';
import { GeminiCompanionChat } from './components/GeminiCompanionChat';
import { NewGameModal } from './components/NewGameModal';
import { ChroniclesModal } from './components/ChroniclesModal';
import { WORLD_PRESETS, ART_STYLES } from './data/presets';
import { adventureAudio } from './utils/audio';
import {
  Character,
  InventoryItem,
  QuestState,
  NPC,
  Choice,
  StoryTurn,
  StoryEngineModel,
  ImageSize,
} from './types/adventure';
import { Package, Scroll, Sparkles, Menu } from 'lucide-react';

const STORAGE_KEY = 'aetheria_cyoa_engine_v1';

export default function App() {
  // Settings & Affordances
  const [storyEngineModel, setStoryEngineModel] = useState<StoryEngineModel>('gemini-3.1-flash-lite');
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>('1K');
  const [autoGenerateImage, setAutoGenerateImage] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Core Game State
  const [character, setCharacter] = useState<Character>({
    name: WORLD_PRESETS[0].defaultCharacter.name,
    classRole: WORLD_PRESETS[0].defaultCharacter.classRole,
    background: 'Cursed survivor searching for the lost flame',
    visualDescription: WORLD_PRESETS[0].defaultCharacter.visualDescription,
    health: 100,
    maxHealth: 100,
    sanity: 90,
    gold: 45,
    level: 1,
    statusEffects: [],
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'item-1',
      name: 'Runic Silver Blade',
      description: 'An ancient shortsword engraved with dormant lunar sigils.',
      category: 'weapon',
      quantity: 1,
      rarity: 'Rare',
    },
    {
      id: 'item-2',
      name: 'Vial of Starlight Nectar',
      description: 'Restores 25 Health and bolsters sanity against shadow chills.',
      category: 'potion',
      quantity: 2,
      rarity: 'Uncommon',
    },
    {
      id: 'item-3',
      name: 'Torn Astrolabe Fragment',
      description: 'Brass quadrant humming faintly when pointed toward the Citadel.',
      category: 'relic',
      quantity: 1,
      rarity: 'Epic',
    },
  ]);

  const [questState, setQuestState] = useState<QuestState>({
    title: 'The Shattered Eclipse',
    currentObjective: 'Breach the Petristone Gate and bypass the Ashen Wardens.',
    summary: 'Gather the fragmented Sparks of the Eclipse before the Void Swarm consumes the Citadel.',
    milestonesCompleted: ['Escaped the Collapsed Catacombs'],
    sideQuests: [
      {
        id: 'sq-1',
        title: 'The Blind Scholar\'s Request',
        description: 'Recover the etched tablet from the gatehouse rubble.',
        status: 'Active',
      },
    ],
  });

  const [npcs, setNpcs] = useState<NPC[]>([
    {
      id: 'npc-1',
      name: 'Lady Vespera',
      description: 'A veiled apostate nun carrying an extinguished iron lantern.',
      relationship: 'Ally',
      status: 'Resting by the bonefire near the archway',
    },
  ]);

  const [worldSetting, setWorldSetting] = useState<string>(WORLD_PRESETS[0].genre);
  const [artStyle, setArtStyle] = useState<string>(WORLD_PRESETS[0].artStyle);
  const [visualAnchor, setVisualAnchor] = useState<string>(WORLD_PRESETS[0].defaultCharacter.visualDescription);

  // Turns & Choices
  const [currentTurn, setCurrentTurn] = useState<StoryTurn | null>(null);
  const [turnsHistory, setTurnsHistory] = useState<StoryTurn[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isChroniclesOpen, setIsChroniclesOpen] = useState<boolean>(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isStartingNewGame, setIsStartingNewGame] = useState<boolean>(false);

  // Highlights when AI alters state
  const [inventoryHighlight, setInventoryHighlight] = useState<boolean>(false);
  const [questHighlight, setQuestHighlight] = useState<boolean>(false);

  // Load from local storage or trigger initial game
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.character && parsed.currentTurn) {
          setCharacter(parsed.character);
          setInventory(parsed.inventory || []);
          setQuestState(parsed.questState || {});
          setNpcs(parsed.npcs || []);
          setWorldSetting(parsed.worldSetting || WORLD_PRESETS[0].genre);
          setArtStyle(parsed.artStyle || WORLD_PRESETS[0].artStyle);
          setVisualAnchor(parsed.visualAnchor || WORLD_PRESETS[0].defaultCharacter.visualDescription);
          setCurrentTurn(parsed.currentTurn);
          setTurnsHistory(parsed.turnsHistory || []);
          setChoices(parsed.choices || []);
          setStoryEngineModel(parsed.storyEngineModel || 'gemini-3.1-flash-lite');
          setSelectedImageSize(parsed.selectedImageSize || '1K');
          return;
        }
      } catch (e) {
        console.warn('Could not restore saved game:', e);
      }
    }

    // Default opening turn if empty
    initializeDefaultAdventure();
  }, []);

  // Save state on change
  useEffect(() => {
    if (!currentTurn) return;
    const stateToSave = {
      character,
      inventory,
      questState,
      npcs,
      worldSetting,
      artStyle,
      visualAnchor,
      currentTurn,
      turnsHistory,
      choices,
      storyEngineModel,
      selectedImageSize,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [
    character,
    inventory,
    questState,
    npcs,
    worldSetting,
    artStyle,
    visualAnchor,
    currentTurn,
    turnsHistory,
    choices,
    storyEngineModel,
    selectedImageSize,
  ]);

  // Audio mute/unmute sync
  const toggleSound = () => {
    adventureAudio.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Generate Image Handler
  const handleGenerateImage = useCallback(
    async (sizeToUse?: ImageSize, customPrompt?: string) => {
      const targetSize = sizeToUse || selectedImageSize;
      const scenePrompt =
        customPrompt ||
        currentTurn?.sceneImagePrompt ||
        `Atmospheric scene in ${currentTurn?.location || 'ancient ruins'}. ${currentTurn?.summary || ''}`;

      setIsGeneratingImage(true);
      try {
        const res = await fetch('/api/adventure/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: scenePrompt,
            characterVisual: visualAnchor,
            artStyle: artStyle,
            model: 'gemini-3-pro-image-preview', // Mandated high-quality image model
            imageSize: targetSize, // Mandated 1K, 2K, 4K affordance
            aspectRatio: '16:9',
          }),
        });

        if (!res.ok) {
          throw new Error('Image generation request failed');
        }

        const data = await res.json();
        if (data.imageUrl) {
          setCurrentTurn((prev) =>
            prev
              ? {
                  ...prev,
                  sceneImageUrl: data.imageUrl,
                  imageSizeUsed: targetSize,
                }
              : null
          );
          setTurnsHistory((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              sceneImageUrl: data.imageUrl,
              imageSizeUsed: targetSize,
            };
            return updated;
          });
        }
      } catch (err: any) {
        console.error('Error in handleGenerateImage:', err);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [selectedImageSize, currentTurn, visualAnchor, artStyle]
  );

  // Initialize Default Opening Scene
  const initializeDefaultAdventure = async () => {
    const openingTurn: StoryTurn = {
      turnNumber: 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userChoice: 'Entered the Broken Threshold',
      location: 'The Sunken Archway of Petristone',
      dangerLevel: 'Tense',
      storyText: `The black basalt towers of the Petristone Citadel loom through an eternal twilight. A century ago, the sun fractured into burning silver slivers, plunging the kingdom into the Silent Eclipse.

You stand before the archway, your boots crunching over calcified ash and forgotten sigils. Ahead, gargantuan portcullis chains groan in the dry wind. Two Ashen Wardens—their hollow armor wrapped in funereal shrouds—patrol the perimeter with rusted halberds, their eyeless visors glowing with pale corpse-light.

To your left, a crumbling drainage aqueduct drips with phosphorescent water, reeking of old sulfur. To your right, a sheer cliffside staircase leads up toward the bell tower where an extinguished beacon remains unlit. The air tastes of static and dead stars.`,
      summary: 'Arrived at the Petristone Citadel gates guarded by Ashen Wardens.',
      sceneImagePrompt:
        'A dark fantasy oil painting of a cloaked adventurer with silver-streaked hair and runic scar gazing at a massive gothic basalt citadel in eternal twilight with Ashen Wardens guarding rusted portcullis',
    };

    const openingChoices: Choice[] = [
      {
        id: 'c1',
        text: 'Draw your Runic Silver Blade and challenge the Ashen Wardens in direct combat.',
        type: 'combat',
        hint: 'Direct assault tests your steel against ancient armor.',
      },
      {
        id: 'c2',
        text: 'Slip into the shadowed drainage aqueduct to bypass the gatehouse unseen.',
        type: 'stealth',
        hint: 'Requires silence and resilience against noxious fumes.',
      },
      {
        id: 'c3',
        text: 'Climb the crumbling staircase toward the bell tower to scout from high vantage.',
        type: 'exploration',
        hint: 'Reveals the citadel layout and possible secondary entrances.',
      },
      {
        id: 'c4',
        text: 'Present the Torn Astrolabe Fragment toward the wardens to see if they recognize the royal crest.',
        type: 'risky',
        hint: 'Could trigger reverence or provoke immediate hostility.',
      },
    ];

    setCurrentTurn(openingTurn);
    setTurnsHistory([openingTurn]);
    setChoices(openingChoices);

    // Initial image generation
    if (autoGenerateImage) {
      handleGenerateImage('1K', openingTurn.sceneImagePrompt);
    }
  };

  // Progress Adventure Turn
  const handleSelectChoice = async (userActionText: string) => {
    if (isLoading) return;

    adventureAudio.playPageTurn();
    setIsLoading(true);

    try {
      const response = await fetch('/api/adventure/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyEngineModel,
          character,
          inventory,
          questState,
          npcs,
          artStyle,
          worldSetting,
          history: turnsHistory,
          userAction: userActionText,
        }),
      });

      if (!response.ok) {
        throw new Error('Adventure engine turn failed');
      }

      const data = await response.json();

      // 1. DYNAMIC INVENTORY UPDATES (AI updates automatically)
      let nextInventory = [...inventory];
      let itemChanged = false;

      // Add items
      if (data.inventoryUpdates?.added && data.inventoryUpdates.added.length > 0) {
        itemChanged = true;
        adventureAudio.playItemFound();
        data.inventoryUpdates.added.forEach((newItem: InventoryItem) => {
          const existing = nextInventory.find(
            (i) => i.id === newItem.id || i.name.toLowerCase() === newItem.name.toLowerCase()
          );
          if (existing) {
            existing.quantity += newItem.quantity || 1;
          } else {
            nextInventory.push({
              ...newItem,
              id: newItem.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            });
          }
        });
      }

      // Remove items
      if (data.inventoryUpdates?.removedIds && data.inventoryUpdates.removedIds.length > 0) {
        itemChanged = true;
        const removed = new Set(data.inventoryUpdates.removedIds);
        nextInventory = nextInventory.filter((i) => !removed.has(i.id) && !removed.has(i.name));
      }

      // Modify quantities
      if (data.inventoryUpdates?.quantityChanges && data.inventoryUpdates.quantityChanges.length > 0) {
        itemChanged = true;
        data.inventoryUpdates.quantityChanges.forEach((qc: { id: string; delta: number }) => {
          const item = nextInventory.find((i) => i.id === qc.id || i.name === qc.id);
          if (item) {
            item.quantity = Math.max(0, item.quantity + qc.delta);
          }
        });
        nextInventory = nextInventory.filter((i) => i.quantity > 0);
      }

      if (itemChanged) {
        setInventory(nextInventory);
        setInventoryHighlight(true);
        setTimeout(() => setInventoryHighlight(false), 2500);
      }

      // 2. DYNAMIC QUEST UPDATES (AI updates automatically)
      let questChanged = false;
      const nextQuestState: QuestState = { ...questState };

      if (data.questUpdates?.newObjective && data.questUpdates.newObjective.trim()) {
        questChanged = true;
        nextQuestState.currentObjective = data.questUpdates.newObjective;
      }

      if (data.questUpdates?.newMilestoneCompleted && data.questUpdates.newMilestoneCompleted.trim()) {
        questChanged = true;
        adventureAudio.playQuestChime();
        nextQuestState.milestonesCompleted = [
          ...nextQuestState.milestonesCompleted,
          data.questUpdates.newMilestoneCompleted,
        ];
      }

      if (data.questUpdates?.sideQuestsAdded && data.questUpdates.sideQuestsAdded.length > 0) {
        questChanged = true;
        nextQuestState.sideQuests = [
          ...(nextQuestState.sideQuests || []),
          ...data.questUpdates.sideQuestsAdded,
        ];
      }

      if (data.questUpdates?.sideQuestStatusChanges && data.questUpdates.sideQuestStatusChanges.length > 0) {
        questChanged = true;
        data.questUpdates.sideQuestStatusChanges.forEach((sc: { id: string; status: 'Active' | 'Completed' }) => {
          const sq = nextQuestState.sideQuests.find((s) => s.id === sc.id || s.title === sc.id);
          if (sq) sq.status = sc.status;
        });
      }

      if (questChanged) {
        setQuestState(nextQuestState);
        setQuestHighlight(true);
        setTimeout(() => setQuestHighlight(false), 2500);
      }

      // 3. CHARACTER STATS UPDATES
      const newHealth = Math.max(
        0,
        Math.min(character.maxHealth, character.health + (data.healthDelta || 0))
      );
      const newSanity = Math.max(0, Math.min(100, character.sanity + (data.sanityDelta || 0)));
      const newGold = Math.max(0, character.gold + (data.goldDelta || 0));

      if ((data.healthDelta || 0) < 0) {
        adventureAudio.playDangerNote();
      }

      setCharacter((prev) => ({
        ...prev,
        health: newHealth,
        sanity: newSanity,
        gold: newGold,
      }));

      // 4. NPCS UPDATES
      if (data.npcUpdates) {
        let nextNpcs = [...npcs];
        if (data.npcUpdates.added && data.npcUpdates.added.length > 0) {
          nextNpcs = [...nextNpcs, ...data.npcUpdates.added];
        }
        if (data.npcUpdates.updated && data.npcUpdates.updated.length > 0) {
          data.npcUpdates.updated.forEach((u: any) => {
            const match = nextNpcs.find((n) => n.id === u.id || n.name === u.id);
            if (match) {
              if (u.relationship) match.relationship = u.relationship;
              if (u.status) match.status = u.status;
            }
          });
        }
        setNpcs(nextNpcs);
      }

      // 5. NEW STORY TURN
      const nextTurnNumber = (currentTurn?.turnNumber || 1) + 1;
      const newTurn: StoryTurn = {
        turnNumber: nextTurnNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userChoice: userActionText,
        storyText: data.narrative || 'The shadows expand silently.',
        location: data.location || currentTurn?.location || 'Unknown Passage',
        dangerLevel: data.dangerLevel || 'Tense',
        summary: data.turnSummary || data.narrative.slice(0, 180),
        statusLog: data.statusLog,
        sceneImagePrompt: data.sceneImagePrompt,
      };

      setCurrentTurn(newTurn);
      setTurnsHistory((prev) => [...prev, newTurn]);
      setChoices(data.choices || []);

      // 6. REAL-TIME CONSISTENT ART GENERATION
      if (autoGenerateImage && data.sceneImagePrompt) {
        handleGenerateImage(selectedImageSize, data.sceneImagePrompt);
      }
    } catch (err: any) {
      console.error('Turn progress failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start new adventure modal submission
  const handleStartAdventure = async (config: {
    genre: string;
    customWorldPrompt: string;
    characterName: string;
    characterClass: string;
    visualDescription: string;
    artStyle: string;
    storyEngineModel: StoryEngineModel;
    imageSize: ImageSize;
  }) => {
    setIsStartingNewGame(true);
    try {
      const response = await fetch('/api/adventure/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to start new adventure');
      }

      const data = await response.json();

      const newChar: Character = {
        name: config.characterName,
        classRole: config.characterClass,
        background: config.customWorldPrompt || config.genre,
        visualDescription: config.visualDescription,
        health: 100,
        maxHealth: 100,
        sanity: 100,
        gold: 50,
        level: 1,
        statusEffects: [],
      };

      const openingTurn: StoryTurn = {
        turnNumber: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userChoice: 'Journey Commenced',
        location: data.location || 'The Awakening Threshold',
        dangerLevel: data.dangerLevel || 'Safe',
        storyText: data.narrative,
        summary: data.turnSummary || data.narrative?.slice(0, 150),
        sceneImagePrompt: data.sceneImagePrompt,
      };

      setCharacter(newChar);
      setInventory(data.inventory || []);
      setQuestState(data.quest || {});
      setNpcs(data.npcs || []);
      setWorldSetting(config.genre);
      setArtStyle(config.artStyle);
      setVisualAnchor(config.visualDescription);
      setStoryEngineModel(config.storyEngineModel);
      setSelectedImageSize(config.imageSize);
      setCurrentTurn(openingTurn);
      setTurnsHistory([openingTurn]);
      setChoices(data.choices || []);
      setIsNewGameOpen(false);

      if (autoGenerateImage && data.sceneImagePrompt) {
        handleGenerateImage(config.imageSize, data.sceneImagePrompt);
      }
    } catch (err: any) {
      console.error('Error starting game:', err);
    } finally {
      setIsStartingNewGame(false);
    }
  };

  // Export game savefile
  const handleExportGame = () => {
    const saveData = {
      character,
      inventory,
      questState,
      npcs,
      worldSetting,
      artStyle,
      visualAnchor,
      currentTurn,
      turnsHistory,
      choices,
      storyEngineModel,
      selectedImageSize,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetheria-save-${character.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import game savefile
  const handleImportGame = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.character && parsed.currentTurn) {
            setCharacter(parsed.character);
            setInventory(parsed.inventory || []);
            setQuestState(parsed.questState || {});
            setNpcs(parsed.npcs || []);
            setWorldSetting(parsed.worldSetting || WORLD_PRESETS[0].genre);
            setArtStyle(parsed.artStyle || WORLD_PRESETS[0].artStyle);
            setVisualAnchor(parsed.visualAnchor || WORLD_PRESETS[0].defaultCharacter.visualDescription);
            setCurrentTurn(parsed.currentTurn);
            setTurnsHistory(parsed.turnsHistory || []);
            setChoices(parsed.choices || []);
            if (parsed.storyEngineModel) setStoryEngineModel(parsed.storyEngineModel);
            if (parsed.selectedImageSize) setSelectedImageSize(parsed.selectedImageSize);
          }
        } catch (err) {
          console.error('Failed to parse savefile:', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Handle Using an item in narrative
  const handleUseItem = (item: InventoryItem) => {
    handleSelectChoice(`I reach into my pouch, draw forth ${item.name}, and utilize its power in this situation.`);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        storyEngineModel={storyEngineModel}
        onSelectStoryModel={setStoryEngineModel}
        imageSize={selectedImageSize}
        onSelectImageSize={setSelectedImageSize}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenChronicles={() => setIsChroniclesOpen(true)}
        onOpenNewGame={() => setIsNewGameOpen(true)}
        onExportGame={handleExportGame}
        onImportGame={handleImportGame}
        onToggleCompanion={() => setIsCompanionOpen(!isCompanionOpen)}
        isCompanionOpen={isCompanionOpen}
      />

      {/* Stats Bar */}
      <StatsBar
        character={character}
        location={currentTurn?.location || 'Unknown Passage'}
        dangerLevel={currentTurn?.dangerLevel || 'Tense'}
        turnNumber={currentTurn?.turnNumber || 1}
      />

      {/* Mobile Drawer Toggle Floating Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-bold shadow-xl border border-amber-400/50 flex items-center gap-1.5"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs">Ledger</span>
        </button>
      </div>

      {/* Main Game Layout (Story Engine & Dynamic Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Story & Choices Viewer */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <StoryViewer
            currentTurn={currentTurn}
            choices={choices}
            onSelectChoice={handleSelectChoice}
            isLoading={isLoading}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            selectedImageSize={selectedImageSize}
            onSelectImageSize={setSelectedImageSize}
            autoGenerateImage={autoGenerateImage}
            onToggleAutoGenerateImage={setAutoGenerateImage}
          />
        </main>

        {/* Dynamic Sidebar (Inventory, Current Quest, NPCs, Visual Identity) */}
        <DynamicSidebar
          inventory={inventory}
          questState={questState}
          npcs={npcs}
          visualAnchor={visualAnchor}
          artStyle={artStyle}
          onUpdateVisualAnchor={setVisualAnchor}
          onUseItem={handleUseItem}
          inventoryHighlight={inventoryHighlight}
          questHighlight={questHighlight}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Gemini DM Companion Multi-Turn Chatbot */}
      <GeminiCompanionChat
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        character={character}
        questState={questState}
        inventory={inventory}
        currentLocation={currentTurn?.location || 'Unknown'}
        narrativeContext={currentTurn?.storyText || ''}
      />

      {/* New Game / World Builder Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartAdventure={handleStartAdventure}
        isStarting={isStartingNewGame}
      />

      {/* Chronicles / Story Timeline Modal */}
      <ChroniclesModal
        isOpen={isChroniclesOpen}
        onClose={() => setIsChroniclesOpen(false)}
        turns={turnsHistory}
        characterName={character.name}
      />
    </div>
  );
}
