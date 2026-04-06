"use client";

import { useMemo, useState } from "react";
import { FileUp, MessageSquarePlus, Rocket, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { Textarea } from "@/components/ui/textarea";
import { conversationService } from "@/features/conversations/services/conversation-service";
import { fileUploadService } from "@/features/files/services/file-upload-service";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";
import { sectionService } from "@/features/sections/services/section-service";
import { sprintService } from "@/features/sprints/services/sprint-service";
import { useUiStore } from "@/store/ui-store";

const sprintColumns = ["To Do", "In Progress", "Done"] as const;

export function SectionWorkspacePage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);

  const {
    activeProject,
    updateCanvasValue,
    addConversation,
    removeConversation,
    addFileRecord,
    removeFileRecord,
    addSprintTask,
    moveSprintTask,
    removeSprintTask,
    updateSprintField
  } = useProjectWorkspace();
  const selectedSectionId = useUiStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useUiStore((state) => state.setSelectedSectionId);

  const [conversationDraft, setConversationDraft] = useState({
    person: "",
    context: "",
    painPoints: "",
    signals: "",
    trustLevel: "Medium" as "Low" | "Medium" | "High",
    learned: ""
  });
  const [fileDraft, setFileDraft] = useState({ name: "", url: "" });
  const [sprintTaskDraft, setSprintTaskDraft] = useState("");
  const [draggedSprintTaskId, setDraggedSprintTaskId] = useState<string | null>(null);

  const sections = sectionService.list(activeProject);
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const conversations = useMemo(
    () =>
      conversationService
        .list(activeProject)
        .filter(
          (conversation) =>
            conversation.context.toLowerCase().includes(selectedSection.title.toLowerCase()) ||
            conversation.context.toLowerCase().includes(selectedSection.id.toLowerCase())
        ),
    [activeProject, selectedSection.id, selectedSection.title]
  );
  const files = useMemo(
    () =>
      activeProject.files.filter(
        (file) =>
          file.target.toLowerCase().includes(selectedSection.title.toLowerCase()) ||
          file.target.toLowerCase().includes(selectedSection.id.toLowerCase())
      ),
    [activeProject.files, selectedSection.id, selectedSection.title]
  );
  const sprint = sprintService.get(activeProject);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <SectionContainer
          eyebrow="Project Workspace"
          title={activeProject.name}
          description="Each section has its own notes, conversations, files and sprint work. Keep the dashboard for orientation, and do the real work here."
          className="bg-white"
        >
          <div className="space-y-2">
            {sections.map((section) => {
              const active = section.id === selectedSection.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{section.title}</p>
                  <p className={`mt-2 text-xs leading-5 ${active ? "text-white/75" : "text-slate-500"}`}>
                    {section.helper}
                  </p>
                </button>
              );
            })}
          </div>
        </SectionContainer>

        <div className="space-y-5">
          <SectionContainer
            eyebrow="Section"
            title={selectedSection.title}
            description={selectedSection.prompt}
            className="bg-white"
            action={
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
                {selectedSection.value.trim() ? "Filled" : "Needs content"}
              </div>
            }
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-5">
                <SectionContainer
                  eyebrow="Notes"
                  title="Working notes"
                  description="Use this as the live document for the current section."
                  className="bg-slate-50"
                >
                  <Textarea
                    value={selectedSection.value}
                    onChange={(event) => updateCanvasValue(selectedSection.id, event.target.value)}
                    placeholder={`Write the current state of ${selectedSection.title.toLowerCase()} here.`}
                    className="min-h-64"
                  />
                </SectionContainer>

                <SectionContainer
                  eyebrow="Files"
                  title="Attachments"
                  description="Cloudinary-ready placeholder flow. Keep only files relevant to this section."
                  className="bg-slate-50"
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Input
                      value={fileDraft.name}
                      onChange={(event) => setFileDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="File name"
                    />
                    <Input
                      value={fileDraft.url}
                      onChange={(event) => setFileDraft((current) => ({ ...current, url: event.target.value }))}
                      placeholder="URL or upload placeholder"
                    />
                    <Button
                      onClick={async () => {
                        if (!fileDraft.name.trim()) return;
                        await fileUploadService.createPlaceholderUpload({
                          fileName: fileDraft.name.trim(),
                          target: selectedSection.title
                        });
                        addFileRecord(fileDraft.name.trim(), selectedSection.title, fileDraft.url.trim());
                        setFileDraft({ name: "", url: "" });
                      }}
                    >
                      <FileUp className="h-4 w-4" />
                      Add file
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {files.length > 0 ? (
                      files.map((file) => (
                        <div key={file.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{file.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{file.target}</p>
                            </div>
                            <button type="button" onClick={() => removeFileRecord(file.id)} className="text-slate-400 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                        No files attached to this section yet.
                      </div>
                    )}
                  </div>
                </SectionContainer>
              </div>

              <div className="space-y-5">
                <SectionContainer
                  eyebrow="Conversations"
                  title="Signals and calls"
                  description="Quick-log only what matters for this section."
                  className="bg-slate-50"
                >
                  <div className="space-y-3">
                    <Input
                      value={conversationDraft.person}
                      onChange={(event) => setConversationDraft((current) => ({ ...current, person: event.target.value }))}
                      placeholder="Who did you speak with?"
                    />
                    <Input
                      value={conversationDraft.context}
                      onChange={(event) =>
                        setConversationDraft((current) => ({ ...current, context: event.target.value }))
                      }
                      placeholder={`Context, for example ${selectedSection.title} interview`}
                    />
                    <Textarea
                      value={conversationDraft.painPoints}
                      onChange={(event) =>
                        setConversationDraft((current) => ({ ...current, painPoints: event.target.value }))
                      }
                      placeholder="Pain points"
                      className="min-h-24"
                    />
                    <Textarea
                      value={conversationDraft.learned}
                      onChange={(event) =>
                        setConversationDraft((current) => ({ ...current, learned: event.target.value }))
                      }
                      placeholder="What changed in your understanding?"
                      className="min-h-24"
                    />
                    <Button
                      className="w-full justify-between"
                      onClick={() => {
                        if (!conversationDraft.person.trim() || !conversationDraft.context.trim()) return;
                        addConversation(
                          conversationDraft.person,
                          conversationDraft.context || selectedSection.title,
                          conversationDraft.painPoints,
                          conversationDraft.signals,
                          conversationDraft.trustLevel,
                          conversationDraft.learned
                        );
                        setConversationDraft({
                          person: "",
                          context: `${selectedSection.title} interview`,
                          painPoints: "",
                          signals: "",
                          trustLevel: "Medium",
                          learned: ""
                        });
                      }}
                    >
                      <span>Log conversation</span>
                      <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {conversations.length > 0 ? (
                      conversations.map((conversation) => (
                        <div key={conversation.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{conversation.person}</p>
                              <p className="mt-1 text-xs text-slate-500">{conversation.context}</p>
                            </div>
                            <button type="button" onClick={() => removeConversation(conversation.id)} className="text-slate-400 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {conversation.learned ? (
                            <p className="mt-3 text-sm leading-6 text-slate-700">{conversation.learned}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                        No section conversations yet.
                      </div>
                    )}
                  </div>
                </SectionContainer>

                <SectionContainer
                  eyebrow="Sprint"
                  title="Section sprint board"
                  description="Strict kanban for the tasks tied to this project sprint."
                  className="bg-slate-50"
                  action={
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {sprint.tasks.filter((task) => task.status === "Done").length}/{sprint.tasks.length} done
                    </div>
                  }
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      value={sprintTaskDraft}
                      onChange={(event) => setSprintTaskDraft(event.target.value)}
                      placeholder={`Add a task for ${selectedSection.title}`}
                    />
                    <Button
                      onClick={() => {
                        if (!sprintTaskDraft.trim()) return;
                        addSprintTask(sprintTaskDraft.trim());
                        setSprintTaskDraft("");
                      }}
                    >
                      <Rocket className="h-4 w-4" />
                      Add task
                    </Button>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-3">
                    {sprintColumns.map((column) => (
                      <div
                        key={column}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (!draggedSprintTaskId) return;
                          moveSprintTask(draggedSprintTaskId, column);
                          setDraggedSprintTaskId(null);
                        }}
                        className="rounded-[1.3rem] border border-dashed border-slate-300 bg-white/80 p-3"
                      >
                        <p className="mb-3 text-sm font-semibold text-slate-900">{column}</p>
                        <div className="space-y-3">
                          {sprint.tasks
                            .filter((task) => task.status === column)
                            .map((task) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={() => setDraggedSprintTaskId(task.id)}
                                onDragEnd={() => setDraggedSprintTaskId(null)}
                                className="cursor-grab rounded-[1.1rem] border border-slate-200 bg-white p-4 active:cursor-grabbing"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                  <button type="button" onClick={() => removeSprintTask(task.id)} className="text-slate-400 hover:text-rose-600">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {sprintColumns.map((status) => (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => moveSprintTask(task.id, status)}
                                      className={`rounded-full px-3 py-1 text-xs ${
                                        status === task.status ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionContainer>
              </div>
            </div>
          </SectionContainer>

          <SectionContainer
            eyebrow="Sprint Context"
            title="Goal, review, retrospective"
            description="Keep sprint metadata close to the section without opening a separate heavy dashboard."
            className="bg-white"
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <Textarea
                value={sprint.goal}
                onChange={(event) => updateSprintField("goal", event.target.value)}
                placeholder="Sprint goal"
                className="min-h-28"
              />
              <Textarea
                value={sprint.review}
                onChange={(event) => updateSprintField("review", event.target.value)}
                placeholder="Sprint review"
                className="min-h-28"
              />
              <Textarea
                value={sprint.retrospective}
                onChange={(event) => updateSprintField("retrospective", event.target.value)}
                placeholder="Retrospective"
                className="min-h-28"
              />
            </div>
          </SectionContainer>
        </div>
      </section>
    </div>
  );
}
