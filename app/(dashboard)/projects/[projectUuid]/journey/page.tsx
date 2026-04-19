"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Save, X, Sparkles, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectApi } from "@/features/projects/services/project-api";

interface Substep {
  id: string;
  text: string;
}

interface Step {
  id: string;
  stage: string;
  goal: string;
  action: string;
  painPoint: string;
  opportunity: string;
  emotion: number;
  substeps: Substep[];
}

const STAGES = [
  { id: "awareness", name: "Awareness" },
  { id: "consideration", name: "Consideration" },
  { id: "purchase", name: "Purchase" },
  { id: "retention", name: "Retention" },
  { id: "advocacy", name: "Advocacy" },
];

function createSteps(): Step[] {
  return STAGES.map(stage => ({
    id: stage.id,
    stage: stage.id,
    goal: "",
    action: "",
    painPoint: "",
    opportunity: "",
    emotion: 3,
    substeps: [],
  }));
}

function EmotionBar({ value, onChange }: { value: number; onChange?: (val: number) => void }) {
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const labels = ["Pain", "Struggle", "Neutral", "Satisfied", "Delighted"];
  return (
    <div 
      className="flex gap-1 items-center border border-white p-1 rounded" 
      onClick={(e) => e.stopPropagation()}
      style={{ background: 'white', padding: '4px' }}
    >
      <span style={{color: 'black', fontSize: '10px'}}>Mood:</span>
      {[1,2,3,4,5].map(n => (
        <div
          key={n}
          onClick={() => { onChange?.(n); }}
          className={`h-4 w-6 cursor-pointer rounded-sm transition-colors ${n <= value ? colors[n-1] : "bg-gray-300"}`}
        />
      ))}
      <span style={{color: 'black', fontSize: '10px'}}>{labels[value-1]}</span>
    </div>
  );
}

function JourneyMap3D({ currentSteps, improvedSteps }: { 
  currentSteps: Step[]; 
  improvedSteps: Step[];
}) {
  const emotionColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  const selectedCurrent = currentSteps.find(s => s.id === selectedStage);
  const selectedImproved = improvedSteps.find(s => s.id === selectedStage);
  const stageName = selectedStage ? STAGES.find(s => s.id === selectedStage)?.name : "";
  
  return (
    <div className="w-full min-h-[600px] relative rounded-2xl overflow-hidden bg-white/5 border border-white/20 backdrop-blur-xl p-6">
      <div className="relative flex items-center justify-between gap-4 min-w-[800px] h-[450px]">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-8">
          <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
            <div className="w-8 h-px bg-green-500" />
            With Solution
          </div>
          <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
            <div className="w-8 h-px bg-red-500" />
            Current
          </div>
        </div>
        {currentSteps.map((step, i) => {
          const currentY = 350 - (step.emotion - 1) * 40;
          const improvedY = 100 - (improvedSteps[i].emotion - 1) * 40;
          const isSelected = selectedStage === step.id;
          
          return (
            <div key={step.id} className="relative w-32 h-full ml-8">
              <div 
                className="absolute cursor-pointer transition-transform hover:scale-110"
                style={{ top: `${Math.max(20, Math.min(380, improvedY))}px`, left: '50%', transform: 'translateX(-50%)' }}
                onClick={() => setSelectedStage(step.id)}
              >
                <div className={`w-10 h-10 rounded-full ${emotionColors[improvedSteps[i].emotion - 1]} flex items-center justify-center text-white text-sm font-bold shadow-lg ${isSelected ? 'ring-4 ring-white/50 scale-110' : ''}`}>
                  {i + 1}
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap">
                  {STAGES[i].name}
                </div>
              </div>
              
              <div 
                className="absolute cursor-pointer transition-transform hover:scale-110"
                style={{ top: `${Math.max(20, Math.min(380, currentY))}px`, left: '50%', transform: 'translateX(-50%)' }}
                onClick={() => setSelectedStage(step.id)}
              >
                <div className={`w-10 h-10 rounded-full ${emotionColors[step.emotion - 1]} flex items-center justify-center text-white text-sm font-bold shadow-lg ${isSelected ? 'ring-4 ring-white/50 scale-110' : ''}`}>
                  {i + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between text-sm text-white/60 px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Current Journey</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>With Solution</span>
        </div>
      </div>
      
      {selectedStage && selectedCurrent && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setSelectedStage(null)}>
          <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{stageName}</h3>
              <button onClick={() => setSelectedStage(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="text-sm font-medium text-red-400 mb-2">Current</h4>
                <p className="text-xs text-white/60">{selectedCurrent.goal || "No goal set"}</p>
                <div className="mt-2 flex gap-1">
                  <EmotionBar value={selectedCurrent.emotion} />
                </div>
              </div>
              
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2">With Solution</h4>
                <p className="text-xs text-white/60">{selectedImproved?.goal || "No goal set"}</p>
                <div className="mt-2 flex gap-1">
                  <EmotionBar value={selectedImproved?.emotion || 3} />
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button onClick={() => setSelectedStage(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserJourneyPage() {
  const params = useParams();
  const projectUuid = (params.projectUuid || params.projectId) as string;
  
  const [view, setView] = useState<"current" | "improved">("current");
  const [currentSteps, setCurrentSteps] = useState<Step[]>(createSteps());
  const [improvedSteps, setImprovedSteps] = useState<Step[]>(createSteps());
  const [expanded, setExpanded] = useState<string | null>("awareness");
  const [mode, setMode] = useState<"editor" | "map">("editor");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectUuid || projectUuid === "new") {
      setIsLoading(false);
      return;
    }
    loadJourney();
  }, [projectUuid]);

  async function loadJourney() {
    if (!projectUuid || projectUuid === "new") return;
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const data = await projectApi.getJourney(projectUuid);
      if (data && data.current) {
        setCurrentSteps(data.current);
      }
      if (data && data.improved) {
        setImprovedSteps(data.improved);
      }
    } catch (e) {
      console.error("Failed to load journey:", e);
    } finally {
      setIsLoading(false);
    }
  }
  const [isSaving, setIsSaving] = useState(false);

  const saveJourney = async () => {
    if (!projectUuid) return;
    setIsSaving(true);
    try {
      await projectApi.saveJourney(projectUuid, { current: currentSteps, improved: improvedSteps });
    } catch  {
    } finally {
      setIsSaving(false);
    }
  };

  const update = (list: Step[], setList: React.Dispatch<React.SetStateAction<Step[]>>, id: string, field: string, value: any) => {
    setList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const activeSteps = view === "current" ? currentSteps : improvedSteps;
  const setActiveSteps = view === "current" ? setCurrentSteps : setImprovedSteps;

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 pb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <div className="h-6 w-56 animate-pulse rounded bg-white/15" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/10" />
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 pb-8">
      <div className="sticky top-0 z-40 px-6 py-4 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">User Journey Map</h1>
                <p className="text-sm text-white/60">Map your user's path to value</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-xl overflow-hidden border border-white/20">
                  <button 
                    onClick={() => setMode("editor")}
                    className={`px-4 py-2 text-sm font-medium transition-all ${mode === "editor" ? "bg-white/20 text-white" : "bg-transparent text-white/60 hover:text-white"}`}
                  >
                    Editor
                  </button>
                  <button 
                    onClick={() => setMode("map")}
                    className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${mode === "map" ? "bg-cyan-500/80 text-white" : "bg-transparent text-white/60 hover:text-white"}`}
                  >
                    <Eye className="w-4 h-4" />
                    3D Map
                  </button>
                </div>
                {mode === "editor" && (
                  <div className="flex rounded-xl overflow-hidden border border-white/20">
                    <button 
                      onClick={() => setView("current")}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${view === "current" ? "bg-rose-500/80 text-white" : "bg-transparent text-white/60 hover:text-white"}`}
                    >
                      <Zap className="w-4 h-4" />
                      Current
                    </button>
                    <button 
                      onClick={() => setView("improved")}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${view === "improved" ? "bg-emerald-500/80 text-white" : "bg-transparent text-white/60 hover:text-white"}`}
                    >
                      <Sparkles className="w-4 h-4" />
                      With Solution
                    </button>
                  </div>
                )}
                <Button 
                  variant="primary" 
                  className="bg-emerald-500/80 hover:bg-emerald-400 backdrop-blur-sm text-white"
                  onClick={saveJourney}
                  disabled={isSaving}
                >
                  {isSaving ? "..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mode === "editor" ? (
        <div className="max-w-5xl mx-auto px-6 py-8 relative">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500 via-yellow-500 to-emerald-500 rounded-full opacity-30" />
            
            <div className="space-y-4">
              {activeSteps.map((step, index) => {
                const isExpanded = expanded === step.id;
                const stageName = STAGES.find(s => s.id === step.stage)?.name || "";
                
                return (
                  <div key={step.id} className="relative">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : step.id)}
                      className="group relative w-full transition-colors duration-200"
                    >
                      <div className={`
                        relative flex items-center gap-4 p-4 rounded-2xl 
                        transition-colors duration-200
                        ${isExpanded 
                          ? view === "improved" 
                            ? "bg-gradient-to-r from-emerald-500/30 to-emerald-500/10 border border-emerald-400/30 backdrop-blur-xl"
                            : "bg-gradient-to-r from-rose-500/30 to-rose-500/10 border border-rose-400/30 backdrop-blur-xl"
                          : "bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                        }
                      `}>
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold
                          transition-all duration-300 backdrop-blur-sm
                          ${isExpanded 
                            ? view === "improved" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                            : "bg-white/20 text-white/80 group-hover:bg-white/30"
                          }
                        `}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/80 uppercase tracking-wider">{stageName}</span>
                            <span style={{color: 'cyan', fontSize: '10px'}}>emotion:{step.emotion}</span>
                            <EmotionBar value={step.emotion} onChange={(val) => update(activeSteps, setActiveSteps, step.id, "emotion", val)} />
                          </div>
                          <p className="text-sm text-white/50 mt-1 line-clamp-1">
                            {step.goal || step.action || "Click to add details..."}
                          </p>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 ml-4 pl-16 pr-4 pb-4">
                        <div className={`
                          rounded-2xl p-6 border backdrop-blur-xl
                          ${view === "improved" ? "bg-emerald-500/10 border-emerald-400/20" : "bg-white/10 border-white/20"}
                        `}>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <input
                              value={step.goal}
                              onChange={(e) => update(activeSteps, setActiveSteps, step.id, "goal", e.target.value)}
                              placeholder="What is the user's goal at this stage?"
                              className="bg-transparent border-b border-white/20 text-white placeholder-white/40 py-2 focus:outline-none focus:border-emerald-400"
                            />
                            <input
                              value={step.action}
                              onChange={(e) => update(activeSteps, setActiveSteps, step.id, "action", e.target.value)}
                              placeholder="What action do they take?"
                              className="bg-transparent border-b border-white/20 text-white placeholder-white/40 py-2 focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          {view === "current" && (
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <input
                                value={step.painPoint}
                                onChange={(e) => update(activeSteps, setActiveSteps, step.id, "painPoint", e.target.value)}
                                placeholder="What's frustrating or blocking?"
                                className="bg-transparent border-b border-white/20 text-white placeholder-white/40 py-2 focus:outline-none focus:border-rose-400"
                              />
                            </div>
                          )}

                          {view === "improved" && (
                            <input
                              value={step.opportunity}
                              onChange={(e) => update(activeSteps, setActiveSteps, step.id, "opportunity", e.target.value)}
                              placeholder="How does your solution improve this stage?"
                              className="bg-transparent border-b border-white/20 text-white placeholder-white/40 py-2 focus:outline-none focus:border-emerald-400 w-full mb-4"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-white/60">
              Comparing before & after your solution
            </div>
          </div>
          <JourneyMap3D currentSteps={currentSteps} improvedSteps={improvedSteps} />
        </div>
      )}
    </div>
  );
}
