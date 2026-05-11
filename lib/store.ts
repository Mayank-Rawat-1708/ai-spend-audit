"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ToolEntry, UseCase } from "@/types";

interface FormStore {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  addTool: (tool: ToolEntry) => void;
  updateTool: (index: number, tool: Partial<ToolEntry>) => void;
  removeTool: (index: number) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  reset: () => void;
}

const defaultState = {
  tools: [] as ToolEntry[],
  teamSize: 1,
  useCase: "mixed" as UseCase,
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...defaultState,
      addTool: (tool) => set((state) => ({ tools: [...state.tools, tool] })),
      updateTool: (index, updatedTool) =>
        set((state) => ({
          tools: state.tools.map((t, i) => i === index ? { ...t, ...updatedTool } : t),
        })),
      removeTool: (index) =>
        set((state) => ({ tools: state.tools.filter((_, i) => i !== index) })),
      setTeamSize: (teamSize) => set({ teamSize }),
      setUseCase: (useCase) => set({ useCase }),
      reset: () => set(defaultState),
    }),
    { name: "ai-spend-audit-form" }
  )
);
