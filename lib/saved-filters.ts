export interface SavedFilterPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
  filters: {
    days: string;
    status: string;
    minScore: string;
    savedOnly: string;
    category: string;
    searchTerm?: string;
  };
}

export const DEFAULT_FILTER_PRESETS: SavedFilterPreset[] = [
  {
    id: "preset-high-yield",
    name: "High-Yield SaaS (85+)",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    filters: {
      days: "90",
      status: "completed",
      minScore: "85",
      savedOnly: "false",
      category: "all",
    },
  },
  {
    id: "preset-starred",
    name: "Starred Dossiers",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    filters: {
      days: "all",
      status: "all",
      minScore: "0",
      savedOnly: "true",
      category: "all",
    },
  },
  {
    id: "preset-active-scans",
    name: "In-Progress Investigations",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    filters: {
      days: "7",
      status: "in-progress",
      minScore: "0",
      savedOnly: "false",
      category: "all",
    },
  },
];
