"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import type { DemoTask } from "@/types";

interface QuickTasksCardProps {
  draft: string;
  tasks: DemoTask[];
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onToggle: (taskId: string) => void;
}

export function QuickTasksCard({
  draft,
  tasks,
  onDraftChange,
  onAdd,
  onToggle
}: QuickTasksCardProps) {
  return (
    <SectionContainer
      eyebrow="Quick Tasks"
      title="Tiny actions only"
      className="warm-panel"
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Add a quick task"
        />
        <Button onClick={onAdd}>Add</Button>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onToggle(task.id)}
            className="flex w-full items-center gap-3 rounded-3xl bg-surface/80 px-4 py-3 text-left"
          >
            {task.done ? (
              <CheckCircle2 className="h-4 w-4 text-pine" />
            ) : (
              <Circle className="h-4 w-4 text-ink/35" />
            )}
            <span className={`text-sm ${task.done ? "text-ink/50 line-through" : "text-ink/78"}`}>
              {task.title}
            </span>
          </button>
        ))}
      </div>
    </SectionContainer>
  );
}
