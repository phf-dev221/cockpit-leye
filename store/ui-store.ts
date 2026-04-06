"use client";

import { create } from "zustand";

import type { DemoWorkspaceView } from "@/types";

interface UiState {
  selectedSectionId: string;
  lazyMode: boolean;
  workspaceView: DemoWorkspaceView;
  setSelectedSectionId: (sectionId: string) => void;
  toggleLazyMode: () => void;
  setWorkspaceView: (view: DemoWorkspaceView) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedSectionId: "problem-validation",
  lazyMode: true,
  workspaceView: "today",
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
  toggleLazyMode: () => set((state) => ({ lazyMode: !state.lazyMode })),
  setWorkspaceView: (workspaceView) => set({ workspaceView })
}));
