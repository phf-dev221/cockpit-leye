"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import type { CreateProjectPayload } from "@/features/projects/services/project-service";

export interface CreateProjectDraft {
  name: string;
  vision: string;
}

function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function hasUsableVision(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length < 12) {
    return false;
  }

  return countWords(trimmed) >= 2;
}

const CORE_STEPS = [
  {
    id: "name" as const,
    title: "Name your project",
    description: "Choose a memorable name that reflects what you're building.",
    placeholder: "e.g., Teranga Cockpit, Wave, Safi",
    validation: (value: string) => {
      const trimmed = value.trim();
      return trimmed.length >= 3 && trimmed.length <= 80;
    },
  },
  {
    id: "vision" as const,
    title: "One-line vision",
    description: "Describe what you're building in one sentence.",
    placeholder: "Build the operating system for first-time African founders",
    validation: hasUsableVision,
  },
];

export function getEmptyCreateProjectDraft(): CreateProjectDraft {
  return {
    name: "",
    vision: "",
  };
}

export function buildCreateProjectSeed(
  value: CreateProjectDraft
): CreateProjectPayload {
  return {
    founderNote: value.vision.trim(),
    stepValues: {},
    canvasValues: {},
  };
}

function getStepValidationResult(
  stepId: string,
  value: string
): boolean {
  const step = CORE_STEPS.find((item) => item.id === stepId);
  if (!step) return false;
  return step.validation(value);
}

export function ProjectCreationWizard({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Create Project",
}: {
  value: CreateProjectDraft;
  onChange: (value: CreateProjectDraft) => void;
  onSubmit: (seed: CreateProjectPayload) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = CORE_STEPS[currentStepIndex];
  const currentValue = value[currentStep.id];
  const isValid = currentStep.validation(currentValue);

  const completedSteps = CORE_STEPS.filter((step) =>
    getStepValidationResult(
      step.id,
      value[step.id as keyof CreateProjectDraft]
    )
  ).length;

  const progress = Math.round((completedSteps / CORE_STEPS.length) * 100);

  function handleNext() {
    if (currentStepIndex < CORE_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  function handleSubmit() {
    if (
      CORE_STEPS.every((step) =>
        getStepValidationResult(
          step.id,
          value[step.id as keyof CreateProjectDraft]
        )
      )
    ) {
      onSubmit(buildCreateProjectSeed(value));
    }
  }

  const canSubmit = CORE_STEPS.every((step) =>
    getStepValidationResult(step.id, value[step.id as keyof CreateProjectDraft])
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-slate-500">
          Step {currentStepIndex + 1} of {CORE_STEPS.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{currentStep.title}</h2>
        </div>

        <p className="mb-6 text-slate-500">{currentStep.description}</p>

        {currentStep.id === "name" ? (
          <input
            value={currentValue}
            onChange={(event) =>
              onChange({ ...value, [currentStep.id]: event.target.value })
            }
            placeholder={currentStep.placeholder}
            className="mb-4 h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-amber-400"
          />
        ) : (
          <textarea
            value={currentValue}
            onChange={(event) =>
              onChange({ ...value, [currentStep.id]: event.target.value })
            }
            placeholder={currentStep.placeholder}
            rows={4}
            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-amber-400"
          />
        )}

        {currentValue && isValid && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Looks good!</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {CORE_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-3 w-3 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "bg-slate-900"
                  : getStepValidationResult(
                      step.id,
                      value[step.id as keyof CreateProjectDraft]
                    )
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {currentStepIndex < CORE_STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {submitLabel}
          </button>
        )}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
