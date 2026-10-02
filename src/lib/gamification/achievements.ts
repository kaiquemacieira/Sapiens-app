/**
 * SAPIENS gamification — Phase 14 + Phase 16 expansion
 * Local, educational progress — not a social leaderboard.
 */

export type AchievementId =
  | "first_light"
  | "first_search"
  | "first_select"
  | "first_favorite"
  | "first_literature"
  | "first_ai"
  | "observer_mode"
  | "constellation_viewer"
  | "sharer"
  | "deep_sky_five"
  | "catalog_ten"
  | "catalog_twenty"
  | "night_owl"
  | "early_bird"
  | "streak_3"
  | "streak_7"
  | "polymath"
  | "archivist"
  | "galaxy_hopper"
  | "galaxy_scholar"
  | "galaxy_native";

export type AchievementCategory =
  | "start"
  | "explore"
  | "science"
  | "habits"
  | "share";

export interface AchievementDef {
  id: AchievementId;
  title: { en: string; pt: string };
  description: { en: string; pt: string };
  icon: string;
  xp: number;
  category: AchievementCategory;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_light",
    title: { en: "First light", pt: "Primeira luz" },
    description: {
      en: "Open SAPIENS for the first time",
      pt: "Abrir o SAPIENS pela primeira vez",
    },
    icon: "✨",
    xp: 10,
    category: "start",
  },
  {
    id: "first_search",
    title: { en: "Sky searcher", pt: "Buscador do céu" },
    description: {
      en: "Search for an object by name",
      pt: "Buscar um objeto pelo nome",
    },
    icon: "⌕",
    xp: 15,
    category: "explore",
  },
  {
    id: "first_select",
    title: { en: "Pointing observer", pt: "Observador apontando" },
    description: {
      en: "Select an object or sky region",
      pt: "Selecionar um objeto ou região do céu",
    },
    icon: "◎",
    xp: 15,
    category: "explore",
  },
  {
    id: "first_favorite",
    title: { en: "Stargazer’s list", pt: "Lista do astrônomo" },
    description: {
      en: "Save an object to favorites",
      pt: "Salvar um objeto nos favoritos",
    },
    icon: "★",
    xp: 20,
    category: "explore",
  },
  {
    id: "first_literature",
    title: { en: "Into the archives", pt: "Nos arquivos" },
    description: {
      en: "Open the literature explorer",
      pt: "Abrir o explorador de literatura",
    },
    icon: "📚",
    xp: 25,
    category: "science",
  },
  {
    id: "first_ai",
    title: { en: "Ask the sky", pt: "Perguntar ao céu" },
    description: {
      en: "Run a Sapiens AI question",
      pt: "Fazer uma pergunta ao Sapiens IA",
    },
    icon: "◈",
    xp: 30,
    category: "science",
  },
  {
    id: "observer_mode",
    title: { en: "Earth observer", pt: "Observador da Terra" },
    description: {
      en: "Enable observer mode",
      pt: "Ativar o modo observador",
    },
    icon: "🌍",
    xp: 20,
    category: "explore",
  },
  {
    id: "constellation_viewer",
    title: { en: "Pattern finder", pt: "Caçador de padrões" },
    description: {
      en: "View constellation outlines",
      pt: "Ver traçados de constelações",
    },
    icon: "✧",
    xp: 15,
    category: "explore",
  },
  {
    id: "sharer",
    title: { en: "Sky messenger", pt: "Mensageiro do céu" },
    description: {
      en: "Share a sky view or export data",
      pt: "Compartilhar uma vista ou exportar dados",
    },
    icon: "↗",
    xp: 20,
    category: "share",
  },
  {
    id: "deep_sky_five",
    title: { en: "Deep-sky five", pt: "Cinco do céu profundo" },
    description: {
      en: "Explore 5 different objects",
      pt: "Explorar 5 objetos diferentes",
    },
    icon: "❺",
    xp: 40,
    category: "explore",
  },
  {
    id: "catalog_ten",
    title: { en: "Catalog wanderer", pt: "Andarilho do catálogo" },
    description: {
      en: "Explore 10 different objects",
      pt: "Explorar 10 objetos diferentes",
    },
    icon: "❿",
    xp: 60,
    category: "explore",
  },
  {
    id: "catalog_twenty",
    title: { en: "Sky cartographer", pt: "Cartógrafo do céu" },
    description: {
      en: "Explore 20 different objects",
      pt: "Explorar 20 objetos diferentes",
    },
    icon: "🗺",
    xp: 100,
    category: "explore",
  },
  {
    id: "night_owl",
    title: { en: "Night owl", pt: "Coruja noturna" },
    description: {
      en: "Use SAPIENS after 22:00 local time",
      pt: "Usar o SAPIENS depois das 22h",
    },
    icon: "🦉",
    xp: 15,
    category: "habits",
  },
  {
    id: "early_bird",
    title: { en: "Early bird", pt: "Madrugador" },
    description: {
      en: "Use SAPIENS before 07:00 local time",
      pt: "Usar o SAPIENS antes das 7h",
    },
    icon: "🌅",
    xp: 15,
    category: "habits",
  },
  {
    id: "streak_3",
    title: { en: "Three-day streak", pt: "Sequência de 3 dias" },
    description: {
      en: "Open SAPIENS on 3 consecutive days",
      pt: "Abrir o SAPIENS em 3 dias seguidos",
    },
    icon: "🔥",
    xp: 35,
    category: "habits",
  },
  {
    id: "streak_7",
    title: { en: "Week under the stars", pt: "Semana sob as estrelas" },
    description: {
      en: "Open SAPIENS on 7 consecutive days",
      pt: "Abrir o SAPIENS em 7 dias seguidos",
    },
    icon: "🌟",
    xp: 80,
    category: "habits",
  },
  {
    id: "polymath",
    title: { en: "Polymath", pt: "Polímata" },
    description: {
      en: "Use search, literature and AI in one session path",
      pt: "Usar busca, literature e IA no mesmo percurso",
    },
    icon: "🎓",
    xp: 50,
    category: "science",
  },
  {
    id: "archivist",
    title: { en: "Archivist", pt: "Arquivista" },
    description: {
      en: "Open literature 5 times",
      pt: "Abrir a literature 5 vezes",
    },
    icon: "🗂",
    xp: 45,
    category: "science",
  },
  {
    id: "galaxy_hopper",
    title: { en: "Galaxy hopper", pt: "Saltador de galáxias" },
    description: {
      en: "Select 3 different galaxies",
      pt: "Selecionar 3 galáxias diferentes",
    },
    icon: "🌌",
    xp: 40,
    category: "explore",
  },
  {
    id: "galaxy_scholar",
    title: { en: "Galaxy scholar", pt: "Erudito das galáxias" },
    description: {
      en: "Open literature on a galaxy",
      pt: "Abrir literature sobre uma galáxia",
    },
    icon: "📖",
    xp: 30,
    category: "science",
  },
  {
    id: "galaxy_native",
    title: { en: "Local group native", pt: "Nativo do Grupo Local" },
    description: {
      en: "Visit Andromeda, Magellanic Clouds or Milky Way targets",
      pt: "Visitar Andrómeda, Nuvens de Magalhães ou alvos da Via Láctea",
    },
    icon: "🏠",
    xp: 35,
    category: "explore",
  },
];

export function achievementById(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function levelFromXp(xp: number): {
  level: number;
  into: number;
  need: number;
} {
  let level = 1;
  let remaining = xp;
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = 100 * level;
  }
  return { level, into: remaining, need };
}

export const CATEGORY_LABELS: Record<
  AchievementCategory,
  { en: string; pt: string }
> = {
  start: { en: "Start", pt: "Início" },
  explore: { en: "Explore", pt: "Explorar" },
  science: { en: "Science", pt: "Ciência" },
  habits: { en: "Habits", pt: "Hábitos" },
  share: { en: "Share", pt: "Compartilhar" },
};

/** Weekly challenge definitions (rotate by ISO week) */
export interface WeeklyChallenge {
  id: string;
  title: { en: string; pt: string };
  target: number;
  stat: "searches" | "selections" | "literatureOpens" | "aiQueries" | "exports";
  xp: number;
}

const WEEKLY_POOL: WeeklyChallenge[] = [
  {
    id: "w_search",
    title: { en: "Search 5 objects", pt: "Buscar 5 objetos" },
    target: 5,
    stat: "searches",
    xp: 25,
  },
  {
    id: "w_select",
    title: { en: "Select 8 objects", pt: "Selecionar 8 objetos" },
    target: 8,
    stat: "selections",
    xp: 30,
  },
  {
    id: "w_lit",
    title: { en: "Open literature 3 times", pt: "Abrir literature 3 vezes" },
    target: 3,
    stat: "literatureOpens",
    xp: 35,
  },
  {
    id: "w_ai",
    title: { en: "Ask AI twice", pt: "Perguntar à IA 2 vezes" },
    target: 2,
    stat: "aiQueries",
    xp: 30,
  },
  {
    id: "w_export",
    title: { en: "Export once", pt: "Exportar uma vez" },
    target: 1,
    stat: "exports",
    xp: 20,
  },
];

export function currentWeekId(): string {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-W${week}`;
}

export function weeklyChallengesForWeek(weekId: string): WeeklyChallenge[] {
  // deterministic pick of 2 challenges from pool
  let h = 0;
  for (let i = 0; i < weekId.length; i++) h = (h * 31 + weekId.charCodeAt(i)) | 0;
  const a = Math.abs(h) % WEEKLY_POOL.length;
  const b = Math.abs(h * 17) % WEEKLY_POOL.length;
  const first = WEEKLY_POOL[a];
  const second = WEEKLY_POOL[b === a ? (a + 1) % WEEKLY_POOL.length : b];
  return [first, second];
}
