import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini client initialization with mandatory User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to determine model for text/adventure tasks
function getSafeTextModel(requestedModel?: string): string {
  if (requestedModel === 'gemini-3.1-pro-preview') return 'gemini-3.1-pro-preview';
  if (requestedModel === 'gemini-3.5-flash') return 'gemini-3.5-flash';
  return 'gemini-3.1-flash-lite'; // Default low-latency
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 1. START ADVENTURE
app.post('/api/adventure/start', async (req: Request, res: Response) => {
  try {
    const {
      genre,
      customWorldPrompt,
      characterName,
      characterClass,
      visualDescription,
      artStyle,
      storyEngineModel,
    } = req.body;

    const modelToUse = getSafeTextModel(storyEngineModel || 'gemini-3.1-flash-lite');

    const systemPrompt = `You are the master storyteller of an infinite, non-linear choose-your-own-adventure engine.
Your mission is to initiate a captivating, deep, player-driven adventure where every choice genuinely branches the narrative into uncharted territory.

Character Name: ${characterName || 'The Wanderer'}
Character Class: ${characterClass || 'Adventurer'}
Character Appearance: ${visualDescription || 'Weather-worn traveler with sharp eyes and mysterious cloak'}
Genre / Setting: ${genre || 'Dark Fantasy'}
World Context: ${customWorldPrompt || 'An ancient world shrouded in arcane mysteries and perilous intrigue.'}
Art Style: ${artStyle || 'Grim Dark Oil Painting & Chiaroscuro'}

Generate an atmospheric opening scene. You MUST return a valid JSON object matching the requested schema.
- Narrative should be immersive (3-4 vivid paragraphs), establishing immediate stakes, sensory atmosphere, and tension.
- Initial inventory: 3-4 starting thematic items suited to their class.
- Current quest: A compelling primary objective with initial milestone.
- 3 to 4 distinct starting choices (actions) that drastically branch in different directions (e.g. bold direct confrontation, cautious investigation, magical probing, or unearthing a hidden path).
- A detailed prompt for scene image generation that includes the character's visual anchor and artistic style.`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: "Begin the journey. Create the prologue and first crossroad.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of this opening chapter" },
            location: { type: Type.STRING, description: "Specific location name" },
            dangerLevel: { type: Type.STRING, description: "Safe, Tense, Perilous, or Deadly" },
            narrative: { type: Type.STRING, description: "Prologue and opening scene narrative" },
            inventory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, description: "weapon, armor, potion, tool, relic, or lore" },
                  quantity: { type: Type.INTEGER },
                  rarity: { type: Type.STRING, description: "Common, Uncommon, Rare, Epic, or Legendary" },
                },
                required: ["id", "name", "description", "category", "quantity", "rarity"],
              },
            },
            quest: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Main Quest title" },
                currentObjective: { type: Type.STRING, description: "Immediate task to accomplish" },
                summary: { type: Type.STRING, description: "Why this quest matters" },
                milestonesCompleted: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                sideQuests: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      status: { type: Type.STRING, description: "Active or Completed" },
                    },
                    required: ["id", "title", "description", "status"],
                  },
                },
              },
              required: ["title", "currentObjective", "summary", "milestonesCompleted", "sideQuests"],
            },
            npcs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  relationship: { type: Type.STRING, description: "Ally, Neutral, Rival, Enemy, or Unknown" },
                  status: { type: Type.STRING },
                },
                required: ["id", "name", "description", "relationship", "status"],
              },
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING, description: "Action text" },
                  type: { type: Type.STRING, description: "combat, dialogue, exploration, stealth, magic, or risky" },
                  hint: { type: Type.STRING, description: "Subtle hint or tactical cue" },
                },
                required: ["id", "text", "type", "hint"],
              },
            },
            sceneImagePrompt: {
              type: Type.STRING,
              description: "Detailed prompt for generating the scene image with character visual anchor and consistent art style",
            },
            turnSummary: { type: Type.STRING, description: "One sentence chronicle summary" },
          },
          required: [
            "title",
            "location",
            "dangerLevel",
            "narrative",
            "inventory",
            "quest",
            "npcs",
            "choices",
            "sceneImagePrompt",
            "turnSummary",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error starting adventure:', error);
    res.status(500).json({
      error: error.message || 'Failed to initialize adventure prologue.',
    });
  }
});

// 2. PROGRESS ADVENTURE (Infinite branching turns with dynamic sidebar tracking)
app.post('/api/adventure/next', async (req: Request, res: Response) => {
  try {
    const {
      storyEngineModel,
      character,
      inventory,
      questState,
      npcs,
      artStyle,
      worldSetting,
      history,
      userAction,
    } = req.body;

    const modelToUse = getSafeTextModel(storyEngineModel || 'gemini-3.1-flash-lite');

    const recentHistory = (history || []).slice(-4).map((h: any, i: number) => {
      return `Turn ${h.turnNumber || i + 1}:
Choice Made: "${h.userChoice}"
Outcome Summary: ${h.summary || h.storyText?.slice(0, 150)}...
Location: ${h.location || 'Unknown'}`;
    }).join('\n\n');

    const systemPrompt = `You are the master narrative engine for an infinite choose-your-own-adventure game.
The player has complete agency. Every choice genuinely alters the storyline, NPC fates, environment, and stakes. Pre-set paths are strictly forbidden.

WORLD & STYLE:
- World Setting: ${worldSetting || 'Fantasy Realm'}
- Consistent Art Style: ${artStyle || 'Grim Dark Oil Painting & Chiaroscuro'}
- Character Anchor: ${character?.name} (${character?.classRole}). Visual description: "${character?.visualDescription || 'Adventurer'}". Stats: HP ${character?.health}/${character?.maxHealth}, Sanity: ${character?.sanity || 100}%, Gold: ${character?.gold || 0}.

CURRENT INVENTORY:
${JSON.stringify(inventory || [], null, 2)}

CURRENT QUEST & SIDE QUESTS:
${JSON.stringify(questState || {}, null, 2)}

KNOWN NPCS & STATUS:
${JSON.stringify(npcs || [], null, 2)}

RECENT STORY BEATS:
${recentHistory || 'Journey has just begun.'}

PLAYER'S CHOSEN ACTION:
"${userAction}"

CRITICAL INSTRUCTIONS:
1. NARRATIVE: Respond directly to the player's action. Describe immediate visceral consequences, environmental shifts, unexpected reveals, and dialogue. Write 3-4 vivid, compelling paragraphs.
2. DYNAMIC SIDEBAR UPDATES:
   - INVENTORY: You must automatically add new items found or received, remove or decrement consumed or lost items, or update item states.
   - QUEST: Update the current objective if the player made progress or was diverted. Add completed milestones. Unlock or update side quests if discovered or resolved.
   - CHARACTER STATS: Update health (positive for healing, negative for wounds), sanity (stress/horrors), and gold earned/spent.
   - NPCS: Add new NPCs encountered or update existing NPCs' attitude, loyalty, or living status.
3. CHOICES: Provide 3-4 diverse, genuine options for what to do next (combat, stealth, diplomacy, magic, risky gamble, exploration).
4. SCENE IMAGE PROMPT: Create an expressive, high-detail prompt depicting the current scene climax, explicitly embedding the character visual anchor ("${character?.visualDescription || character?.name}") and art style ("${artStyle}").
5. Return strictly a JSON object conforming to the schema.`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: `The player performs this action: "${userAction}". Resolve the turn and output full state changes and next choices.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "Story continuation reacting to the player's choice" },
            location: { type: Type.STRING, description: "Current location name" },
            dangerLevel: { type: Type.STRING, description: "Safe, Tense, Perilous, or Deadly" },
            healthDelta: { type: Type.INTEGER, description: "Health change, e.g. -15 or +20 or 0" },
            sanityDelta: { type: Type.INTEGER, description: "Sanity change, e.g. -10 or +5 or 0" },
            goldDelta: { type: Type.INTEGER, description: "Gold change, e.g. +35 or -10 or 0" },
            statusLog: { type: Type.STRING, description: "Brief toast/notification explaining stat or item changes" },
            inventoryUpdates: {
              type: Type.OBJECT,
              properties: {
                added: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING },
                      quantity: { type: Type.INTEGER },
                      rarity: { type: Type.STRING },
                    },
                    required: ["id", "name", "description", "category", "quantity", "rarity"],
                  },
                },
                removedIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                quantityChanges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      delta: { type: Type.INTEGER },
                    },
                    required: ["id", "delta"],
                  },
                },
              },
              required: ["added", "removedIds", "quantityChanges"],
            },
            questUpdates: {
              type: Type.OBJECT,
              properties: {
                newObjective: { type: Type.STRING, description: "Updated current objective, or empty if unchanged" },
                newMilestoneCompleted: { type: Type.STRING, description: "Description of milestone completed if any" },
                sideQuestsAdded: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ["id", "title", "description", "status"],
                  },
                },
                sideQuestStatusChanges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ["id", "status"],
                  },
                },
              },
              required: ["newObjective", "newMilestoneCompleted", "sideQuestsAdded", "sideQuestStatusChanges"],
            },
            npcUpdates: {
              type: Type.OBJECT,
              properties: {
                added: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      relationship: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ["id", "name", "description", "relationship", "status"],
                  },
                },
                updated: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      relationship: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ["id", "relationship", "status"],
                  },
                },
              },
              required: ["added", "updated"],
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ["id", "text", "type", "hint"],
              },
            },
            sceneImagePrompt: {
              type: Type.STRING,
              description: "Prompt for scene illustration preserving consistent art style and character visual traits",
            },
            turnSummary: { type: Type.STRING, description: "1-sentence summary of this turn for chronicle log" },
          },
          required: [
            "narrative",
            "location",
            "dangerLevel",
            "healthDelta",
            "sanityDelta",
            "goldDelta",
            "statusLog",
            "inventoryUpdates",
            "questUpdates",
            "npcUpdates",
            "choices",
            "sceneImagePrompt",
            "turnSummary",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error progressing adventure:', error);
    res.status(500).json({
      error: error.message || 'Failed to process adventure choice.',
    });
  }
});

// 3. GENERATE HIGH-QUALITY SCENE IMAGES
// Requirement: MUST use model `gemini-3-pro-image-preview` and affordance for user to specify image size (1K, 2K, 4K)
app.post('/api/adventure/generate-image', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      characterVisual,
      artStyle,
      model,
      imageSize, // "1K" | "2K" | "4K"
      aspectRatio, // "16:9" | "1:1" | "4:3" | "3:4"
    } = req.body;

    const requestedModel = model || 'gemini-3-pro-image-preview';
    const targetSize = (['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K') as '1K' | '2K' | '4K';
    const targetAspectRatio = (aspectRatio || '16:9') as '16:9' | '1:1' | '4:3' | '3:4';

    // Build the master prompt with consistency anchors
    const fullPrompt = `Art Style: ${artStyle || 'Grim Dark Oil Painting & Chiaroscuro'}.
Subject & Scene: ${prompt}.
Consistent Character Identity: ${characterVisual || 'Heroic adventurer'}.
Composition: Highly atmospheric, cinematic focal lighting, textured brushwork, rich color palette, masterpiece storytelling illustration, no UI, no text, no modern watermarks.`;

    // Attempt generation with requested model (e.g. gemini-3-pro-image-preview or alias gemini-3-pro-image)
    // with graceful fallback cascade to ensure users always receive their illustration
    const modelCandidates = [
      requestedModel,
      'gemini-3-pro-image',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
    ];

    let lastError: any = null;
    let imageUrl: string | null = null;
    let usedModel: string = requestedModel;

    for (const candidate of modelCandidates) {
      try {
        console.log(`Generating adventure image with model: ${candidate}, size: ${targetSize}`);
        
        // Prepare imageConfig based on model capabilities
        const imageConfig: any = {
          aspectRatio: targetAspectRatio,
        };

        // gemini-3-pro-image and gemini-3.1-flash-image support imageSize (1K, 2K, 4K)
        if (candidate !== 'gemini-3.1-flash-lite-image') {
          imageConfig.imageSize = targetSize;
        }

        const response = await ai.models.generateContent({
          model: candidate,
          contents: {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
          config: {
            imageConfig,
          },
        });

        const candidateParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            usedModel = candidate;
            break;
          }
        }

        if (imageUrl) {
          break; // Successfully generated image!
        }
      } catch (err: any) {
        console.warn(`Model ${candidate} image generation attempt failed:`, err?.message);
        lastError = err;
      }
    }

    if (!imageUrl) {
      throw lastError || new Error('Could not generate scene image with available image models.');
    }

    res.json({
      imageUrl,
      modelUsed: usedModel,
      imageSize: targetSize,
      aspectRatio: targetAspectRatio,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error.message || 'Image generation failed.',
    });
  }
});

// 4. MULTI-TURN GEMINI CHATBOT (Dungeon Master / Companion / Lorekeeper)
// Requirement: Multi-turn chat interface using Gemini with conversation history, scrollable thread, and system instruction to give the chatbot specific roles.
// Models: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for fast tasks.
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      role = 'oracle', // 'oracle' | 'companion' | 'tactician' | 'custom'
      customRoleTitle,
      model = 'gemini-3.5-flash',
      character,
      questState,
      inventory,
      currentLocation,
      narrativeContext,
    } = req.body;

    const safeModel = getSafeTextModel(model);

    // Build role-specific system instruction
    let roleSystemInstruction = '';
    if (role === 'oracle') {
      roleSystemInstruction = `You are the Ancient Oracle and Dungeon Master of this world.
You speak in cryptic, evocative, yet deeply helpful prose. You know the hidden histories, forgotten ruins, and cosmic lore of this world.
Help the adventurer interpret omens, decipher riddles, and reveal the consequences of their potential paths without spoiling future surprises completely.`;
    } else if (role === 'companion') {
      roleSystemInstruction = `You are the adventurer's trusted in-world travelling companion.
Character Companion Persona: A quick-witted, fiercely loyal creature or rogue who travels alongside ${character?.name || 'the player'}.
You react authentically with emotion, banter, worry, or courage based on the events happening. Address the player directly as your friend and travel partner.`;
    } else if (role === 'tactician') {
      roleSystemInstruction = `You are the Veteran Battle Tactician & Survival Arbiter.
You evaluate the player's immediate situation with cold tactical precision, calculating the risks of combat, environmental hazards, resource conservation, and weaknesses of enemies.`;
    } else {
      roleSystemInstruction = `You are ${customRoleTitle || 'an in-game guide and narrator'}. Roleplay consistently with the adventurer in this narrative.`;
    }

    const fullSystemInstruction = `${roleSystemInstruction}

CURRENT ADVENTURE CONTEXT:
- Adventurer: ${character?.name || 'The Wanderer'} (${character?.classRole || 'Adventurer'})
- Current Location: ${currentLocation || 'Unknown'}
- Main Quest: ${questState?.title || 'Undetermined'}: ${questState?.currentObjective || 'Explore the world'}
- Key Inventory: ${(inventory || []).map((i: any) => `${i.name} (x${i.quantity})`).join(', ') || 'Bare essentials'}
- Latest Scene Happenings: "${(narrativeContext || '').slice(-400)}"

Instructions:
- Maintain complete continuity with the adventure state.
- Keep responses engaging, immersive, and formatted with clean paragraphs or bullet points if explaining lore/tactics.
- Stay in character at all times.`;

    // Format contents for multi-turn history
    // messages: [{ role: 'user' | 'model' | 'assistant', text: string }]
    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Greetings, guide. Speak to me of our journey.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: safeModel,
      contents: formattedContents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    res.json({
      text: response.text || '',
      modelUsed: safeModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: error.message || 'Chatbot encountered an error.',
    });
  }
});

// Serve frontend with Vite in dev, or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Adventure Engine server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
