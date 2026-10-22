import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Block, PageTheme, SavedSection, SavedTheme } from '../types/page';
import { useWorkspace } from './WorkspaceContext';
import { uid } from '../utils/id';

const storageKey = (workspaceId: string) => `kubicu.library.${workspaceId}`;

interface LibraryData {
  sections: SavedSection[];
  themes: SavedTheme[];
}

interface LibraryValue extends LibraryData {
  saveSection: (name: string, blocks: Block[]) => SavedSection;
  renameSection: (id: string, name: string) => void;
  deleteSection: (id: string) => SavedSection | undefined;
  restoreSection: (section: SavedSection) => void;
  saveTheme: (name: string, theme: PageTheme) => SavedTheme;
  deleteTheme: (id: string) => SavedTheme | undefined;
  restoreTheme: (theme: SavedTheme) => void;
}

const LibraryContext = createContext<LibraryValue | null>(null);

function read(key: string): LibraryData {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { sections: [], themes: [] };
    const parsed = JSON.parse(raw) as Partial<LibraryData>;
    return {
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : []
    };
  } catch {
    return { sections: [], themes: [] };
  }
}

/** Strips editor-only state so a saved section starts clean wherever it's inserted. */
function cleanBlock(b: Block): Block {
  return { ...b, locked: false, groupId: null };
}

/** Workspace-wide reusable sections and themes, shared by every page in the workspace. */
export function LibraryProvider({ children }: {children: React.ReactNode;}) {
  const key = storageKey(useWorkspace().current.id);
  const [data, setData] = useState<LibraryData>(() => read(key));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {

      // Storage full or blocked — library keeps working for this session.
    }}, [data, key]);

  const saveSection = useCallback((name: string, blocks: Block[]) => {
    const section: SavedSection = { id: uid('sec'), name: name.trim() || 'Untitled section', blocks: blocks.map(cleanBlock), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, sections: [section, ...d.sections] }));
    return section;
  }, []);

  const renameSection = useCallback((id: string, name: string) => {
    setData((d) => ({ ...d, sections: d.sections.map((s) => s.id === id ? { ...s, name: name.trim() || s.name } : s) }));
  }, []);

  const deleteSection = useCallback(
    (id: string) => {
      const found = data.sections.find((s) => s.id === id);
      setData((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== id) }));
      return found;
    },
    [data.sections]
  );

  const restoreSection = useCallback((section: SavedSection) => {
    setData((d) => d.sections.some((s) => s.id === section.id) ? d : { ...d, sections: [section, ...d.sections] });
  }, []);

  const saveTheme = useCallback((name: string, theme: PageTheme) => {
    const saved: SavedTheme = { id: uid('thm'), name: name.trim() || 'My theme', theme: { ...theme }, createdAt: new Date().toISOString() };
    saved.theme.presetId = `saved:${saved.id}`;
    setData((d) => ({ ...d, themes: [saved, ...d.themes] }));
    return saved;
  }, []);

  const deleteTheme = useCallback(
    (id: string) => {
      const found = data.themes.find((t) => t.id === id);
      setData((d) => ({ ...d, themes: d.themes.filter((t) => t.id !== id) }));
      return found;
    },
    [data.themes]
  );

  const restoreTheme = useCallback((theme: SavedTheme) => {
    setData((d) => d.themes.some((t) => t.id === theme.id) ? d : { ...d, themes: [theme, ...d.themes] });
  }, []);

  const value = useMemo(
    () => ({ ...data, saveSection, renameSection, deleteSection, restoreSection, saveTheme, deleteTheme, restoreTheme }),
    [data, saveSection, renameSection, deleteSection, restoreSection, saveTheme, deleteTheme, restoreTheme]
  );
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}