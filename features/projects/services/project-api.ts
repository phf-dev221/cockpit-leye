"use client";

import type { DemoConversation, DemoFileRecord, DemoFocusItem, DemoProject, DemoTask } from "@/types";
import { requestJson } from "@/lib/api/client";
import { getActiveWorkspaceId } from "@/features/auth/services/auth-session";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? "current";

interface ProjectListResponse {
  data?: DemoProject[];
  meta?: {
    activeProjectId?: string | null;
  };
}

interface ProjectResponse {
  data?: DemoProject;
}

interface CollectionResponse<TItem> {
  data?: TItem[];
}

interface ItemResponse<TItem> {
  data?: TItem;
}

interface BackendTask {
  id: string | number;
  title: string;
  status?: "open" | "done";
}

interface BackendFocusItem {
  id: string | number;
  title: string;
  content?: string | null;
}

interface BackendConversation {
  id: string | number;
  person_name: string;
  context: string;
  trust_level?: string | null;
  pain_points_text?: string | null;
  signals_text?: string | null;
  learned_text?: string | null;
}

interface BackendFileRecord {
  id: string | number;
  section_key?: string | null;
  file_name: string;
  secure_url: string;
}

interface BackendNote {
  id: string | number;
  note_type: string;
  title?: string | null;
  content: string;
  section_key?: string | null;
}

export interface ProjectNoteRecord {
  id: string;
  noteType: string;
  title: string;
  content: string;
  sectionKey: string;
}

type RawProjectListResponse = ProjectListResponse | DemoProject[];
type RawProjectResponse = ProjectResponse | DemoProject;
type RawCollectionResponse<TItem> = CollectionResponse<TItem> | TItem[];
type RawItemResponse<TItem> = ItemResponse<TItem> | TItem;

function resolveWorkspaceId(workspaceId?: string) {
  return workspaceId ?? getActiveWorkspaceId() ?? DEFAULT_WORKSPACE_ID;
}

function normalizeProjectListResponse(response: RawProjectListResponse): ProjectListResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        activeProjectId: response[0]?.id ?? null
      }
    };
  }

  return response;
}

function normalizeProjectResponse(response: RawProjectResponse): ProjectResponse {
  if (isWrappedResponse(response)) {
    return response;
  }

  return {
    data: response
  };
}

function normalizeCollectionResponse<TItem>(response: RawCollectionResponse<TItem>): CollectionResponse<TItem> {
  if (Array.isArray(response)) {
    return { data: response };
  }

  return response;
}

function normalizeItemResponse<TItem>(response: RawItemResponse<TItem>): ItemResponse<TItem> {
  if (isWrappedResponse(response)) {
    return response;
  }

  return { data: response };
}

function isWrappedResponse<TItem>(response: TItem | { data?: TItem }): response is { data?: TItem } {
  return typeof response === "object" && response !== null && "data" in response;
}

function normalizeTask(task: BackendTask): DemoTask {
  return {
    id: String(task.id),
    title: task.title,
    done: task.status === "done"
  };
}

function normalizeFocusItem(item: BackendFocusItem): DemoFocusItem {
  return {
    id: String(item.id),
    title: item.title,
    value: item.content ?? ""
  };
}

function normalizeTrustLevel(value?: string | null): DemoConversation["trustLevel"] {
  switch ((value ?? "").toLowerCase()) {
    case "high":
      return "High";
    case "low":
      return "Low";
    default:
      return "Medium";
  }
}

function normalizeConversation(conversation: BackendConversation): DemoConversation {
  return {
    id: String(conversation.id),
    person: conversation.person_name,
    context: conversation.context,
    painPoints: conversation.pain_points_text ?? "",
    signals: conversation.signals_text ?? "",
    trustLevel: normalizeTrustLevel(conversation.trust_level),
    learned: conversation.learned_text ?? ""
  };
}

function normalizeFileRecord(file: BackendFileRecord): DemoFileRecord {
  return {
    id: String(file.id),
    name: file.file_name,
    target: file.section_key ?? "General",
    url: file.secure_url
  };
}

function normalizeNote(note: BackendNote): ProjectNoteRecord {
  return {
    id: String(note.id),
    noteType: note.note_type,
    title: note.title ?? "",
    content: note.content,
    sectionKey: note.section_key ?? ""
  };
}

export const projectApi = {
  async listProjects(workspaceId?: string) {
    const response = await requestJson<RawProjectListResponse>(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects`);
    return normalizeProjectListResponse(response);
  },

  async createProject(
    payload: {
      name: string;
      founderNote?: string;
      stepValues?: Record<string, string | undefined>;
      canvasValues?: Record<string, string | undefined>;
    },
    workspaceId?: string
  ) {
    const response = await requestJson<RawProjectResponse>(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return normalizeProjectResponse(response);
  },

  async updateProject(projectId: string, payload: Partial<DemoProject>, workspaceId?: string) {
    const response = await requestJson<RawProjectResponse>(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    return normalizeProjectResponse(response);
  },

  async deleteProject(projectId: string, workspaceId?: string) {
    return requestJson(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}`, {
      method: "DELETE"
    });
  },

  async listTasks(projectId: string, workspaceId?: string) {
    const response = await requestJson<RawCollectionResponse<BackendTask>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/tasks`
    );
    return (normalizeCollectionResponse(response).data ?? []).map(normalizeTask);
  },

  async createTask(projectId: string, payload: { title: string; status?: "open" | "done"; position?: number }, workspaceId?: string) {
    const response = await requestJson<RawItemResponse<BackendTask>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/tasks`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeTask(item) : null;
  },

  async updateTask(
    projectId: string,
    taskId: string,
    payload: { title?: string; status?: "open" | "done"; position?: number },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendTask>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeTask(item) : null;
  },

  async deleteTask(projectId: string, taskId: string, workspaceId?: string) {
    return requestJson(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE"
    });
  },

  async listFocusItems(projectId: string, workspaceId?: string) {
    const response = await requestJson<RawCollectionResponse<BackendFocusItem>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/focus-items`
    );
    return (normalizeCollectionResponse(response).data ?? []).map(normalizeFocusItem);
  },

  async createFocusItem(
    projectId: string,
    payload: { title: string; content?: string; position?: number; is_pinned?: boolean },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendFocusItem>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/focus-items`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeFocusItem(item) : null;
  },

  async updateFocusItem(
    projectId: string,
    focusItemId: string,
    payload: { title?: string; content?: string; position?: number; is_pinned?: boolean },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendFocusItem>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/focus-items/${focusItemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeFocusItem(item) : null;
  },

  async deleteFocusItem(projectId: string, focusItemId: string, workspaceId?: string) {
    return requestJson(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/focus-items/${focusItemId}`, {
      method: "DELETE"
    });
  },

  async listConversations(projectId: string, workspaceId?: string) {
    const response = await requestJson<RawCollectionResponse<BackendConversation>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/conversations`
    );
    return (normalizeCollectionResponse(response).data ?? []).map(normalizeConversation);
  },

  async createConversation(
    projectId: string,
    payload: {
      person_name: string;
      context: string;
      pain_points_text?: string;
      signals_text?: string;
      trust_level?: string;
      learned_text?: string;
    },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendConversation>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/conversations`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeConversation(item) : null;
  },

  async updateConversation(
    projectId: string,
    conversationId: string,
    payload: {
      person_name?: string;
      context?: string;
      pain_points_text?: string;
      signals_text?: string;
      trust_level?: string;
      learned_text?: string;
    },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendConversation>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/conversations/${conversationId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeConversation(item) : null;
  },

  async deleteConversation(projectId: string, conversationId: string, workspaceId?: string) {
    return requestJson(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/conversations/${conversationId}`,
      {
        method: "DELETE"
      }
    );
  },

  async listFiles(projectId: string, workspaceId?: string) {
    const response = await requestJson<RawCollectionResponse<BackendFileRecord>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/files`
    );
    return (normalizeCollectionResponse(response).data ?? []).map(normalizeFileRecord);
  },

  async createFileRecord(
    projectId: string,
    payload: {
      section_key?: string;
      storage_provider: string;
      provider_public_id: string;
      file_name: string;
      mime_type?: string;
      resource_type?: string;
      file_size_bytes?: number;
      secure_url: string;
      thumbnail_url?: string;
    },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendFileRecord>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/files`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeFileRecord(item) : null;
  },

  async updateFileRecord(
    projectId: string,
    fileId: string,
    payload: {
      section_key?: string;
      file_name?: string;
      mime_type?: string;
      resource_type?: string;
      file_size_bytes?: number;
      secure_url?: string;
      thumbnail_url?: string;
    },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendFileRecord>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/files/${fileId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeFileRecord(item) : null;
  },

  async deleteFileRecord(projectId: string, fileId: string, workspaceId?: string) {
    return requestJson(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/files/${fileId}`, {
      method: "DELETE"
    });
  },

  async listNotes(projectId: string, workspaceId?: string) {
    const response = await requestJson<RawCollectionResponse<BackendNote>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/notes`
    );
    return (normalizeCollectionResponse(response).data ?? []).map(normalizeNote);
  },

  async createNote(
    projectId: string,
    payload: { note_type: string; title?: string; content: string; section_key?: string },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendNote>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/notes`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeNote(item) : null;
  },

  async updateNote(
    projectId: string,
    noteId: string,
    payload: { note_type?: string; title?: string; content?: string; section_key?: string },
    workspaceId?: string
  ) {
    const response = await requestJson<RawItemResponse<BackendNote>>(
      `/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/notes/${noteId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    const item = normalizeItemResponse(response).data;
    return item ? normalizeNote(item) : null;
  },

  async deleteNote(projectId: string, noteId: string, workspaceId?: string) {
    return requestJson(`/api/workspaces/${resolveWorkspaceId(workspaceId)}/projects/${projectId}/notes/${noteId}`, {
      method: "DELETE"
    });
  }
};
