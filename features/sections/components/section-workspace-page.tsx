"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { ExternalLink, FileUp, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { Textarea } from "@/components/ui/textarea";
import { getAuthSession } from "@/features/auth/services/auth-session";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";
import { useUiStore } from "@/store/ui-store";

export function SectionWorkspacePage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);

  const { activeProject, updateCanvasValue, addFileRecord, removeFileRecord } = useProjectWorkspace();
  const selectedSectionId = useUiStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useUiStore((state) => state.setSelectedSectionId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileDraft, setFileDraft] = useState({ name: "" });
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const sections = activeProject.canvases;
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const files = useMemo(
    () =>
      activeProject.files.filter((file) => {
        const target = file.target.toLowerCase();
        return target === selectedSection.id.toLowerCase() || target === selectedSection.title.toLowerCase();
      }),
    [activeProject.files, selectedSection.id, selectedSection.title]
  );

  return (
    <div className="space-y-5">
      <SectionContainer
        eyebrow="Sections"
        title="Project sections"
        description="Choose a section, edit its main note, and keep only the files that matter."
        className="warm-panel"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const active = section.id === selectedSection.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedSectionId(section.id)}
                className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                  active
                    ? "border-pine bg-pine text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold">{section.title}</p>
                <p className={`mt-2 text-xs leading-5 ${active ? "text-white/78" : "text-slate-500"}`}>
                  {section.helper}
                </p>
              </button>
            );
          })}
        </div>
      </SectionContainer>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionContainer
          eyebrow="Current Section"
          title={selectedSection.title}
          description={selectedSection.prompt}
          className="warm-panel"
          action={
            <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
              {selectedSection.value.trim() ? "Saved" : "Empty"}
            </div>
          }
        >
          <div className="space-y-4">
            <Textarea
              value={selectedSection.value}
              onChange={(event) => updateCanvasValue(selectedSection.id, event.target.value)}
              placeholder={`Write the essential notes for ${selectedSection.title.toLowerCase()}.`}
              className="min-h-[380px] bg-white"
            />
          </div>
        </SectionContainer>

        <SectionContainer
          eyebrow="Files"
          title="Section files"
          description="Upload a file or keep a link tied to this section."
          className="warm-panel"
        >
          <div className="space-y-3">
            <Input
              value={fileDraft.name}
              onChange={(event) => setFileDraft({ name: event.target.value })}
              placeholder="File name"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="justify-between"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? "Uploading..." : "Upload file"}
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="justify-between border-slate-200 bg-white text-slate-900"
                onClick={() => {
                  const fallbackName = fileDraft.name.trim();

                  if (!fallbackName) {
                    setFileError("Add a file name before saving a link.");
                    return;
                  }

                  void addFileRecord(fallbackName, selectedSection.id, `https://placeholder.local/${encodeURIComponent(fallbackName)}`);
                  setFileDraft({ name: "" });
                  setFileError(null);
                }}
                disabled={!fileDraft.name.trim() || isUploadingFile}
              >
                Save placeholder
                <FileUp className="h-4 w-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => void handleSectionFileUpload(event)}
            />
            {fileError ? <p className="text-sm text-rose-600">{fileError}</p> : null}
          </div>

          <div className="mt-4 space-y-3">
            {files.length ? (
              files.map((file) => (
                <div key={file.id} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedSection.title}</p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-pine hover:underline"
                      >
                        Open file
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFileRecord(file.id)}
                      className="text-slate-400 transition hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No file linked to this section yet.
              </div>
            )}
          </div>
        </SectionContainer>
      </section>
    </div>
  );

  async function handleSectionFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileError(null);
    setIsUploadingFile(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
      const token = getAuthSession()?.token ?? "";

      const signatureResponse = await fetch(`${baseUrl}/api/files/cloudinary/signature`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include"
      });

      if (!signatureResponse.ok) {
        throw new Error("The upload signature service is unavailable.");
      }

      const signaturePayload = (await signatureResponse.json()) as {
        timestamp: number;
        folder: string;
        api_key: string;
        cloud_name: string;
        upload_preset?: string | null;
        signature: string;
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.api_key);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("folder", signaturePayload.folder);
      formData.append("signature", signaturePayload.signature);

      if (signaturePayload.upload_preset) {
        formData.append("upload_preset", signaturePayload.upload_preset);
      }

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signaturePayload.cloud_name}/auto/upload`, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed.");
      }

      const uploadPayload = (await uploadResponse.json()) as {
        public_id?: string;
        secure_url?: string;
        resource_type?: string;
        bytes?: number;
        original_filename?: string;
      };

      if (!uploadPayload.public_id || !uploadPayload.secure_url) {
        throw new Error("The uploaded file information is incomplete.");
      }

      await addFileRecord(
        fileDraft.name.trim() || file.name || uploadPayload.original_filename || "Section file",
        selectedSection.id,
        uploadPayload.secure_url,
        {
          storageProvider: "cloudinary",
          providerPublicId: uploadPayload.public_id,
          mimeType: file.type || undefined,
          resourceType: uploadPayload.resource_type,
          fileSizeBytes: uploadPayload.bytes
        }
      );

      setFileDraft({ name: "" });
    } catch (caughtError) {
      setFileError(caughtError instanceof Error ? caughtError.message : "Unable to upload the file.");
    } finally {
      setIsUploadingFile(false);
      event.target.value = "";
    }
  }
}
