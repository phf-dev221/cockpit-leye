"use client";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import type { DemoCanvasKey, DemoProject } from "@/types";

interface CoreSetupCardProps {
  project: DemoProject;
  onOpenStrategy: () => void;
  onOpenCanvas: (canvasId: DemoCanvasKey) => void;
}

const setupCards: Array<{ id: DemoCanvasKey; label: string; emptyState: string }> = [
  { id: "problem-validation", label: "Problem statement", emptyState: "Add the problem statement" },
  { id: "icp", label: "ICP", emptyState: "Add the ICP" },
  {
    id: "business-model-canvas",
    label: "Business model",
    emptyState: "Add the business model"
  }
];

export function CoreSetupCard({
  project,
  onOpenStrategy,
  onOpenCanvas
}: CoreSetupCardProps) {
  return (
    <SectionContainer
      eyebrow="Core Setup"
      title="Problem, ICP, business model"
      description="These three blocks stay visible so the project foundation is always in sight."
      action={
        <Button variant="secondary" onClick={onOpenStrategy}>
          Open full strategy
        </Button>
      }
      className="warm-panel"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {setupCards.map((card) => {
          const value = project.canvases.find((canvas) => canvas.id === card.id)?.value;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onOpenCanvas(card.id)}
              className="rounded-[1.5rem] bg-surface/80 p-4 text-left"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-ink/45">{card.label}</p>
              <p className="mt-3 text-sm leading-6 text-ink/80">{value || card.emptyState}</p>
            </button>
          );
        })}
      </div>
    </SectionContainer>
  );
}
