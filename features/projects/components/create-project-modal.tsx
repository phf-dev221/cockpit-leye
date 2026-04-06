"use client";

import { Modal } from "@/components/ui/modal";
import {
  buildCreateProjectSeed,
  type CreateProjectDraft,
  type ProjectCreationWizardProps,
  getEmptyCreateProjectDraft,
  ProjectCreationWizard
} from "@/features/projects/components/project-creation-wizard";

interface CreateProjectModalProps extends ProjectCreationWizardProps {
  open: boolean;
  onClose: () => void;
  value: CreateProjectDraft;
}

export function CreateProjectModal({
  open,
  onClose,
  value,
  onChange,
  onSubmit,
  submitLabel
}: CreateProjectModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-7xl">
      <ProjectCreationWizard
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={submitLabel}
      />
    </Modal>
  );
}

export { buildCreateProjectSeed, getEmptyCreateProjectDraft };
export type { CreateProjectDraft };
