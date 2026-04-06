"use client";

import { Grip } from "lucide-react";

import { SectionContainer } from "@/components/ui/section-container";
import type { DemoBoardCard, DemoBoardLane } from "@/types";

const lanes: Array<{ id: DemoBoardLane; title: string }> = [
  { id: "now", title: "Now" },
  { id: "next", title: "Next" },
  { id: "later", title: "Later" }
];

interface LazyDeskCardProps {
  cards: DemoBoardCard[];
  draggedCardId: string | null;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
  onMoveCard: (cardId: string, lane: DemoBoardLane) => void;
}

export function LazyDeskCard({
  cards,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onMoveCard
}: LazyDeskCardProps) {
  return (
    <SectionContainer
      eyebrow="Lazy Desk"
      title="Drag what matters"
      description="Available on every page so you can always reorder now, next, and later."
      action={<span className="rounded-full bg-surface px-3 py-1 text-xs text-ink/60">global drag and drop</span>}
      className="warm-panel"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {lanes.map((lane) => (
          <div
            key={lane.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!draggedCardId) return;
              onMoveCard(draggedCardId, lane.id);
            }}
            className="rounded-[1.75rem] border border-dashed border-line bg-surface/70 p-3"
          >
            <p className="mb-3 text-sm font-semibold text-ink">{lane.title}</p>
            <div className="space-y-3">
              {cards
                .filter((card) => card.lane === lane.id)
                .map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => onDragStart(card.id)}
                    onDragEnd={onDragEnd}
                    className={`lazy-card cursor-grab rounded-[1.4rem] border border-white/70 bg-white px-4 py-4 shadow-panel active:cursor-grabbing ${
                      card.accent === "pine"
                        ? "lazy-card-pine"
                        : card.accent === "ember"
                          ? "lazy-card-ember"
                          : "lazy-card-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{card.title}</p>
                        <p className="mt-1 text-xs leading-5 text-ink/58">{card.detail}</p>
                      </div>
                      <Grip className="mt-0.5 h-4 w-4 text-ink/35" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
