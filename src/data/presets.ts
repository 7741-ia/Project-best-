import { WorldPreset } from '../types/adventure';

export const ART_STYLES = [
  {
    id: 'oil_chiaroscuro',
    name: 'Grim Dark Oil & Chiaroscuro',
    promptModifier: 'masterpiece dark fantasy oil painting, heavy chiaroscuro lighting, textured canvas brushwork, muted earth tones with luminous gold and blood crimson highlights, Frank Frazetta and Rembrandt mood',
    badge: 'Dark Fantasy',
  },
  {
    id: 'cyberpunk_graphic',
    name: 'Cyberpunk Neon & Inks',
    promptModifier: 'high-contrast graphic novel illustration, vibrant cyan and magenta neon rim lighting, intricate inked line art, gritty dystopian cyberpunk atmosphere, Moebius and Katsuhiro Otomo aesthetics',
    badge: 'Cyberpunk',
  },
  {
    id: 'mythic_watercolor',
    name: 'Ethereal Watercolor & Gold Leaf',
    promptModifier: 'delicate fantasy watercolor wash with gold leaf ink details, soft atmospheric mist, Yoshitaka Amano inspired, elegant poetic mythology, glowing spirits',
    badge: 'Mythic',
  },
  {
    id: 'vintage_pulp',
    name: 'Vintage 70s Pulp Fantasy',
    promptModifier: '1970s vintage pulp fantasy cover art, dramatic heroic composition, saturated pigments, Frank Frazetta and Boris Vallejo style, raw dramatic tension',
    badge: 'Retro',
  },
  {
    id: 'cinematic_anime',
    name: 'Cinematic Anime & Ghibli Detail',
    promptModifier: 'high-end cinematic anime concept art, volumetric cinematic lighting, Studio Ghibli atmospheric details, rich painterly background, evocative emotional depth',
    badge: 'Anime',
  },
];

export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: 'shattered_eclipse',
    title: 'The Shattered Eclipse',
    genre: 'Dark Fantasy & Eldritch Mystery',
    artStyle: 'Grim Dark Oil & Chiaroscuro',
    description: 'A cursed kingdom where the sun broke into shards a century ago. Bloodborne knights and apostate scholars wander petrified forests searching for the Last Spark.',
    defaultCharacter: {
      name: 'Valen Drake',
      classRole: 'Cursed Spellblade',
      visualDescription: 'Lean build, silver-streaked raven hair tied back, a jagged runic scar along the left cheek, worn charcoal leather coat with silver buckles, glowing amethyst runic sword on his back',
    },
  },
  {
    id: 'neon_underbelly',
    title: 'Neon Underbelly: Sector 9',
    genre: 'Cyberpunk & Corporate Espionage',
    artStyle: 'Cyberpunk Neon & Inks',
    description: 'Towering megastructures cast eternal rain over neon-drenched alleys. Megacorps fight shadow wars with rogue bio-hackers over sentient memory cores.',
    defaultCharacter: {
      name: 'Kira Vance',
      classRole: 'Rogue Data-Runner',
      visualDescription: 'Short asymmetrical electric-cyan hair, cybernetic ocular implant with subtle amber HUD glow, matte black armored bomber jacket with holographic patches, wrist-mounted neuro-deck',
    },
  },
  {
    id: 'sunken_colossus',
    title: 'The Sunken Colossus',
    genre: 'Mythic Steampunk & Lost Ruins',
    artStyle: 'Ethereal Watercolor & Gold Leaf',
    description: 'An ancient world of brass automata, cloud archipelagoes, and ocean trenches concealing the dormant engines of primordial titans.',
    defaultCharacter: {
      name: 'Orion Vale',
      classRole: 'Aether Archaeologist',
      visualDescription: 'Amber goggles perched on forehead, windblown auburn hair, brass-plated gauntlet hummed with clockwork aether gears, explorer coat with parchment map scrolls',
    },
  },
  {
    id: 'void_horizon',
    title: 'Void Horizon: Derelict Aegis',
    genre: 'Cosmic Sci-Fi Survival',
    artStyle: 'Grim Dark Oil & Chiaroscuro',
    description: 'Stranded aboard a titanic generational dreadnought that drifted into an anomaly outside charted spacetime. Life support is failing, and something knocks from the outer hull.',
    defaultCharacter: {
      name: 'Dr. Evelyn Cross',
      classRole: 'Exo-Biologist & Engineer',
      visualDescription: 'Pragmatic cropped dark hair, high-collared magnetic pressurized flight suit with emergency trauma seals, plasma torch holstered at waist, determined piercing hazel eyes',
    },
  },
];
