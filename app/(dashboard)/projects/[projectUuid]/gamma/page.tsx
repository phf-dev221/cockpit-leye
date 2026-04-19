"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Plus, 
  ExternalLink, 
  Download, 
  Trash2, 
  Loader2,
  Sparkles,
  Presentation,
  Layout,
  FileText,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play
} from "lucide-react";
import type { GammaPresentation, GammaTemplate } from "@/features/projects/services/project-api";

const templates = [
  { id: "pitch-deck", name: "Pitch Deck", description: "For investor presentations", color: "from-blue-500 to-indigo-600" },
  { id: "product-launch", name: "Product Launch", description: "Launch new products", color: "from-emerald-500 to-teal-600" },
  { id: "quarterly-review", name: "Quarterly Review", description: "Business updates", color: "from-amber-500 to-orange-600" },
  { id: "case-study", name: "Case Study", description: "Customer success stories", color: "from-purple-500 to-pink-600" },
  { id: "team-update", name: "Team Update", description: "Internal communications", color: "from-rose-500 to-red-600" },
];

export default function GammaPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [presentations, setPresentations] = useState<GammaPresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

  const [showGenerator, setShowGenerator] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [format, setFormat] = useState<"presentation" | "document" | "webpage">("presentation");
  const [numCards, setNumCards] = useState(10);

  useEffect(() => {
    if (!projectUuid) return;
    loadPresentations();
  }, [projectUuid]);

  useEffect(() => {
    if (pollingIds.size === 0) return;
    
    const interval = setInterval(() => {
      pollAllStatuses();
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingIds]);

  const loadPresentations = async () => {
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const data = await projectApi.listGammaPresentations(projectUuid);
      setPresentations(data);
      
      const pending = data.filter(p => p.status === "pending" || p.status === "processing");
      const pendingIds = pending.map(p => p.generationId).filter((id): id is string => !!id);
      setPollingIds(new Set(pendingIds));
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const pollAllStatuses = async () => {
    const { projectApi } = await import("@/features/projects/services/project-api");
    const updatedIds = new Set<string>();
    
    for (const id of pollingIds) {
      try {
        const status = await projectApi.getGammaStatus(projectUuid, id);
        if (status.status !== "completed" && status.status !== "failed") {
          updatedIds.add(id);
        }
      } catch {
      }
    }
    
    if (updatedIds.size > 0) {
      setPollingIds(updatedIds);
      loadPresentations();
    } else {
      setPollingIds(new Set());
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    
    setGenerating(true);
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      
      let result;
      if (selectedTemplate) {
        result = await projectApi.generateFromTemplate(
          projectUuid,
          selectedTemplate,
          content,
          { title: title || undefined }
        );
      } else {
        result = await projectApi.generateGammaPresentation(
          projectUuid,
          content,
          { title: title || undefined, format, numCards }
        );
      }

      if (result.success && result.generationId) {
        setPollingIds(prev => new Set([...prev, result.generationId]));
      }
    } catch {
    } finally {
      setGenerating(false);
      setShowGenerator(false);
      setContent("");
      setTitle("");
      setSelectedTemplate("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this presentation?")) return;
    
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      await projectApi.deleteGammaPresentation(projectUuid, id);
      loadPresentations();
    } catch {
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "pending": 
      case "processing": return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Presentation className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Presentations
              </h1>
              <p className="text-slate-500">
                Generate AI slides with Gamma
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/25"
          >
            <Sparkles className="h-4 w-4" />
            New Presentation
          </button>
        </div>

        {presentations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No presentations yet
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Create your first AI-generated presentation in seconds
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Generate My First Presentation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {presentations.map((pres) => (
              <div
                key={pres.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all group"
              >
                <div className={`h-3 ${
                  pres.status === "completed" ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                  pres.status === "failed" ? "bg-gradient-to-r from-red-500 to-rose-500" :
                  "bg-gradient-to-r from-amber-500 to-orange-500"
                }`} />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                      <Layout className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pres.status)}
                      <button
                        onClick={() => handleDelete(pres.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1 truncate pr-2">{pres.title}</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {new Date(pres.createdAt).toLocaleDateString("en-US", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  <div className="flex items-center gap-2">
                    {pres.gammaUrl ? (
                      <a
                        href={pres.gammaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </a>
                    ) : pres.status === "pending" || pres.status === "processing" ? (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Failed
                      </button>
                    )}
                    {pres.exportUrl && (
                      <a
                        href={pres.exportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4 text-slate-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Generate Presentation
                  </h2>
                  <p className="text-sm text-slate-500">
                    Describe what you want to create
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Presentation title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Product launch strategy"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Template (optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      !selectedTemplate 
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Layout className="h-5 w-5 text-slate-600 mb-1" />
                    <span className="text-sm font-medium block">Blank</span>
                  </button>
                  {templates.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTemplate === t.id 
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-medium block">{t.name}</span>
                      <span className="text-xs text-slate-500">{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!selectedTemplate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="presentation">Presentation</option>
                      <option value="document">Document</option>
                      <option value="webpage">Webpage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Number of slides
                    </label>
                    <input
                      type="number"
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value) || 10)}
                      min={1}
                      max={50}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Content to generate
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your presentation in detail...\n\nEx: A product launch strategy for a fintech startup in West Africa, targeting young professionals aged 25-35, with slides on problem, solution, market, business model, and team."
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowGenerator(false);
                  setContent("");
                  setTitle("");
                  setSelectedTemplate("");
                }}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !content.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
