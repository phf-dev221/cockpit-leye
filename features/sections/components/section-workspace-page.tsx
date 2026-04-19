"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { ExternalLink, FileUp, Link2, Trash2, Upload, Cloud, FileText, Image, Film, File, ChevronRight, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";
import { useUiStore } from "@/store/ui-store";

const sectionColors: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
  icp: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", hover: "hover:border-blue-400" },
  market: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", hover: "hover:border-emerald-400" },
  problem: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", hover: "hover:border-rose-400" },
  solution: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", hover: "hover:border-violet-400" },
  differentiator: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", hover: "hover:border-amber-400" },
  business: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", hover: "hover:border-cyan-400" },
};

function getFileIcon(mimeType?: string) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Film;
  return FileText;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileCard({ file, onDelete, sectionTitle }: { file: any; onDelete: () => void; sectionTitle: string }) {
  const FileIcon = getFileIcon(file.mimeType);

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md">
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-2 rounded-full bg-slate-100 p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <FileIcon className="h-5 w-5 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-950">{file.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{sectionTitle}</p>
          {file.fileSizeBytes && <p className="mt-1 text-xs text-slate-400">{formatFileSize(file.fileSizeBytes)}</p>}
        </div>
      </div>

      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        View
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function SectionCard({ section, isActive, onClick }: { section: any; isActive: boolean; onClick: () => void }) {
  const colors = sectionColors[section.id.toLowerCase()] || sectionColors.icp;
  const isCompleted = section.value?.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-2xl border-2 p-5 text-left transition-all ${
        isActive
          ? "border-slate-800 bg-slate-900 text-white shadow-lg"
          : `border-slate-200 bg-white ${colors.hover} hover:shadow-md`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/20" : colors.bg}`}>
          {isCompleted ? (
            <CheckCircle2 className={`h-5 w-5 ${isActive ? "text-white" : "text-emerald-600"}`} />
          ) : (
            <Circle className={`h-5 w-5 ${isActive ? "text-white/50" : "text-slate-300"}`} />
          )}
        </div>
        <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isActive ? "text-white/50" : "text-slate-300"}`} />
      </div>
      
      <p className={`mt-4 text-base font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>
        {section.title}
      </p>
      <p className={`mt-2 text-sm leading-relaxed line-clamp-2 ${isActive ? "text-white/70" : "text-slate-500"}`}>
        {section.helper}
      </p>
      
      <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${isActive ? "text-white/60" : "text-slate-400"}`}>
        {isCompleted ? (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Completed
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3" />
            In progress
          </span>
        )}
      </div>
    </button>
  );
}

export function SectionWorkspacePage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);

  const { activeProject, updateCanvasValue, addFileRecord, removeFileRecord } = useProjectWorkspace();
  const selectedSectionId = useUiStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useUiStore((state) => state.setSelectedSectionId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileDraft, setFileDraft] = useState({ name: "" });
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sections = activeProject?.canvases ?? [];
  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const files = useMemo(() => {
    if (!activeProject || !selectedSection) return [];
    return activeProject.files.filter((file) => {
      const target = file.target.toLowerCase();
      return target === selectedSection.id.toLowerCase() || target === selectedSection.title.toLowerCase();
    });
  }, [activeProject, selectedSection]);

  const handleSectionFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeProject) return;

    const sectionId = activeProject.canvases.find(s => s.id === selectedSectionId)?.id ?? activeProject.canvases[0]?.id;
    if (!sectionId) return;

    setFileError(null);
    setIsUploadingFile(true);
    setUploadProgress(10);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

      setUploadProgress(20);
      const signatureResponse = await fetch(`${baseUrl}/api/files/cloudinary/signature`, {
        method: "POST",
        credentials: "include"
      });

      if (!signatureResponse.ok) {
        throw new Error("Upload service unavailable");
      }

      setUploadProgress(40);
      const signaturePayload = (await signatureResponse.json()) as any;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.api_key);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("folder", signaturePayload.folder);
      formData.append("signature", signaturePayload.signature);

      if (signaturePayload.upload_preset) {
        formData.append("upload_preset", signaturePayload.upload_preset);
      }

      setUploadProgress(60);
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signaturePayload.cloud_name}/auto/upload`, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(80);
      const uploadPayload = (await uploadResponse.json()) as any;

      if (!uploadPayload.public_id || !uploadPayload.secure_url) {
        throw new Error("Invalid upload response");
      }

      await addFileRecord(
        fileDraft.name.trim() || file.name || "Section file",
        sectionId,
        uploadPayload.secure_url,
        {
          storageProvider: "cloudinary",
          providerPublicId: uploadPayload.public_id,
          mimeType: file.type || undefined,
          resourceType: uploadPayload.resource_type,
          fileSizeBytes: uploadPayload.bytes
        }
      );

      setUploadProgress(100);
      setFileDraft({ name: "" });
    } catch (caughtError) {
      setFileError(caughtError instanceof Error ? caughtError.message : "Upload failed");
    } finally {
      setIsUploadingFile(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  }, [activeProject, addFileRecord, fileDraft.name, selectedSectionId]);

  if (!activeProject || !selectedSection) {
    return <EmptyProjectState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Complete each section to build your project</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isActive={section.id === selectedSection.id}
            onClick={() => setSelectedSectionId(section.id)}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedSection.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{selectedSection.prompt}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${selectedSection.value?.trim() ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {selectedSection.value?.trim() ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </>
              ) : (
                <>
                  <Circle className="h-3 w-3 animate-pulse" />
                  In progress
                </>
              )}
            </div>
          </div>

          <Textarea
            value={selectedSection.value}
            onChange={(event) => updateCanvasValue(selectedSection.id, event.target.value)}
            placeholder={`Write your answers for ${selectedSection.title.toLowerCase()}...`}
            className="min-h-[400px] resize-none border-slate-200 bg-slate-50 text-slate-900 leading-relaxed"
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">{selectedSection.value?.trim()?.length || 0} characters</p>
            <Button variant="ghost" onClick={() => updateCanvasValue(selectedSection.id, "")} className="text-slate-500 hover:text-slate-700">
              Clear
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Attachments</h3>
          <p className="text-sm text-slate-500 mb-4">Add files or links to this section</p>

          {isUploadingFile && (
            <div className="space-y-2 rounded-xl bg-blue-50 p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-blue-700">
                  <Cloud className="h-4 w-4 animate-bounce" />
                  Uploading...
                </span>
                <span className="text-blue-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Input
              value={fileDraft.name}
              onChange={(e) => setFileDraft({ name: e.target.value })}
              placeholder="File name (optional)"
              className="border-slate-200"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploadingFile} 
                className="bg-slate-900 hover:bg-slate-800"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                  const name = fileDraft.name.trim();
                  if (!name) {
                    setFileError("Enter a name for the link");
                    return;
                  }
                  addFileRecord(name, selectedSection.id, `https://${name.toLowerCase().replace(/\s+/g, "-")}.com`);
                  setFileDraft({ name: "" });
                  setFileError(null);
                }}
                disabled={!fileDraft.name.trim() || isUploadingFile}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Add link
              </Button>
            </div>
          </div>

          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={handleSectionFileUpload} 
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" 
          />

          {fileError && <p className="text-sm text-rose-600 mt-3">{fileError}</p>}

          <div className="mt-6 space-y-3">
            {files.length > 0 ? (
              files.map((file) => (
                <FileCard key={file.id} file={file} sectionTitle={selectedSection.title} onDelete={() => removeFileRecord(file.id)} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                <Cloud className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No files attached</p>
                <p className="text-xs text-slate-400">Upload files or add links above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
