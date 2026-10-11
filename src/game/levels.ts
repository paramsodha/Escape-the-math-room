import dungeon from "@/assets/dungeon-room.jpg";
import sky from "@/assets/sky-room.jpg";
import forest from "@/assets/level-forest.jpg";
import lab from "@/assets/level-lab.jpg";
import paradox from "@/assets/level-paradox.jpg";
import type { LevelDef } from "./types";

export const LEVELS: LevelDef[] = [
  { id: "dungeon", number: 1, name: "The Forgotten Dungeon", tagline: "Sets · Relations · Functions", description: "Ancient stone, flickering torches and a rune-sealed gate that remembers its old mathematics.", image: dungeon, playable: true },
  { id: "sky-tower", number: 2, name: "The Sky Tower", tagline: "Functions · Relations · Limits", description: "A glass observation deck above a glowing city, where a dormant transit ring waits for power.", image: sky, playable: true },
  { id: "forest", number: 3, name: "The Enchanted Forest", tagline: "Coming soon", description: "Luminous mushrooms, old ruins and a giant tree hiding a magical door.", image: forest, playable: false },
  { id: "lab", number: 4, name: "The Quantum Laboratory", tagline: "Coming soon", description: "Holograms, glass chambers and an energy core waiting to be restored.", image: lab, playable: false },
  { id: "paradox", number: 5, name: "The Grand Paradox", tagline: "Coming soon", description: "A cosmic observatory of golden gears and star maps — the final escape.", image: paradox, playable: false },
];

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id);
