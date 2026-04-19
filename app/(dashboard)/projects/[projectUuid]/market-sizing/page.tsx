"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  Globe, 
  Users,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  PieChart,
  Map
} from "lucide-react";
import { projectApi } from "@/features/projects/services/project-api";

interface MarketData {
  totalCustomers: string;
  pricePerCustomer: string;
  targetSegment: string;
  samPercent: string;
  somPercent: string;
  geography: string;
  industry: string;
  notes: string;
}

const steps = [
  { id: 1, title: "What is Market Sizing?", icon: Lightbulb },
  { id: 2, title: "Calculate TAM", icon: Globe },
  { id: 3, title: "Calculate SAM", icon: Target },
  { id: 4, title: "Calculate SOM", icon: TrendingUp },
  { id: 5, title: "Your Market Map", icon: Map },
];

export default function MarketSizingPage() {
  const params = useParams();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<MarketData>({
    totalCustomers: "",
    pricePerCustomer: "",
    targetSegment: "",
    samPercent: "20",
    somPercent: "5",
    geography: "",
    industry: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectUuid) return;
    loadData();
  }, [projectUuid]);

  async function loadData() {
    try {
      const result = await projectApi.getMarketSizing(projectUuid);
      if (result && typeof result === 'object') {
        const apiData = result as any;
        setData({
          totalCustomers: apiData.totalCustomers || "",
          pricePerCustomer: apiData.pricePerCustomer || "",
          targetSegment: apiData.targetSegment || "",
          samPercent: apiData.samPercent || "20",
          somPercent: apiData.somPercent || "5",
          geography: apiData.geography || "",
          industry: apiData.industry || "",
          notes: apiData.notes || ""
        });
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveData() {
    setSaving(true);
    try {
      await projectApi.saveMarketSizing(projectUuid, data as unknown as Record<string, unknown>);
      alert("Saved!");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }

  const totalCustomers = parseFloat(data.totalCustomers) || 0;
  const pricePerCustomer = parseFloat(data.pricePerCustomer) || 0;
  const tam = totalCustomers * pricePerCustomer;
  const sam = Math.round(tam * (parseFloat(data.samPercent) || 20) / 100);
  const som = Math.round(sam * (parseFloat(data.somPercent) || 5) / 100);

  function formatMoney(num: number): string {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  }

  function canProceedToStep(stepId: number): boolean {
    if (stepId === 2) return true;
    if (stepId === 3) return tam > 0;
    if (stepId === 4) return sam > 0;
    if (stepId === 5) return som > 0;
    return true;
  }

  const StepIcon = steps[currentStep - 1]?.icon || Lightbulb;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-500" />
            Market Sizing
          </h1>
          <p className="text-slate-500 text-sm">Calculate your TAM, SAM & SOM</p>
        </div>
        <button onClick={saveData} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const canAccess = canProceedToStep(step.id);
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canAccess && setCurrentStep(step.id)}
                  disabled={!canAccess}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    isActive 
                      ? "bg-slate-900 text-white" 
                      : isCompleted 
                        ? "bg-emerald-50 text-emerald-700"
                        : canAccess
                          ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          : "bg-slate-50 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className={`h-4 w-4 mx-1 ${isCompleted ? "text-emerald-500" : "text-slate-300"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              What is Market Sizing?
            </h2>
            <p className="text-amber-800 mb-4">
              Market sizing is the process of estimating the potential size of a market for your product or service. 
              It helps you understand the revenue opportunity and make informed business decisions.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Meet TAM, SAM & SOM</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  TAM - Total Available Market
                </h4>
                <p className="text-sm text-blue-800 mt-1">
                  The total market demand for your product. Imagine you could reach everyone 
                  with no competition. This is your "pie in the sky" number.
                </p>
                <div className="mt-2 text-xs text-blue-600 bg-blue-100 inline-block px-2 py-1 rounded">
                  Formula: Total Customers × Price per Customer
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  SAM - Serviceable Available Market
                </h4>
                <p className="text-sm text-emerald-800 mt-1">
                  The segment of TAM that your business can realistically serve. Consider your 
                  geography, pricing, and distribution capabilities.
                </p>
                <div className="mt-2 text-xs text-emerald-600 bg-emerald-100 inline-block px-2 py-1 rounded">
                  Formula: TAM × % of market you can serve
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
                <h4 className="font-bold text-amber-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  SOM - Serviceable Obtainable Market
                </h4>
                <p className="text-sm text-amber-800 mt-1">
                  The portion of SAM you can actually capture in the near term. This factors in 
                  your competition, marketing capabilities, and market saturation.
                </p>
                <div className="mt-2 text-xs text-amber-600 bg-amber-100 inline-block px-2 py-1 rounded">
                  Formula: SAM × % market share you can capture
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-3">Example from Seer Interactive:</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Imagine an e-commerce platform for handmade goods:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-medium">TAM:</span> 10M customers × $500/year = <span className="font-bold text-blue-600">$5B</span></li>
                <li><span className="font-medium">SAM:</span> Targeting only US customers (30% of market) = <span className="font-bold text-emerald-600">$1.5B</span></li>
                <li><span className="font-medium">SOM:</span> Realistically capturing 5% = <span className="font-bold text-amber-600">$75M</span></li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => setCurrentStep(2)}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            Let's Calculate Your TAM <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Globe className="h-6 w-6" />
              Step 1: Calculate Your TAM
            </h2>
            <p className="text-blue-800 mt-2">
              TAM = Total Potential Customers × Average Annual Revenue per Customer
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Who are your potential customers?
              </label>
              <input
                type="text"
                value={data.targetSegment}
                onChange={(e) => setData(prev => ({ ...prev, targetSegment: e.target.value }))}
                placeholder="e.g., Small businesses in the US, Hospitals in Africa, Solo founders..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">Be specific about who would buy your product</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                How many potential customers exist in this market?
              </label>
              <input
                type="number"
                value={data.totalCustomers}
                onChange={(e) => setData(prev => ({ ...prev, totalCustomers: e.target.value }))}
                placeholder="e.g., 1000000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use research reports, industry data, or the bottom-up approach
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What is the average annual revenue per customer (ARPC)?
              </label>
              <input
                type="number"
                value={data.pricePerCustomer}
                onChange={(e) => setData(prev => ({ ...prev, pricePerCustomer: e.target.value }))}
                placeholder="e.g., 1000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                How much would each customer pay per year?
              </p>
            </div>

            {data.totalCustomers && data.pricePerCustomer && (
              <div className="p-4 bg-blue-100 rounded-xl">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-bold">TAM = </span>
                  {parseInt(data.totalCustomers).toLocaleString()} customers × ${parseFloat(data.pricePerCustomer)} 
                  = <span className="font-bold text-xl">{formatMoney(tam)}</span>
                </p>
                <p className="text-xs text-blue-600">
                  This is your Total Available Market - the maximum if you could serve everyone!
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedToStep(3)}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Next: SAM <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <Target className="h-6 w-6" />
              Step 2: Calculate Your SAM
            </h2>
            <p className="text-emerald-800 mt-2">
              SAM = TAM × % of market you can realistically serve
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">
                Your TAM: <span className="font-bold">{formatMoney(tam)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What % of the market can you actually serve?
              </label>
              <input
                type="number"
                value={data.samPercent}
                onChange={(e) => setData(prev => ({ ...prev, samPercent: e.target.value }))}
                placeholder="e.g., 20"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                Consider: geography, pricing, distribution, product features...
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 30, 50].map(pct => (
                <button
                  key={pct}
                  onClick={() => setData(prev => ({ ...prev, samPercent: String(pct) }))}
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    data.samPercent === String(pct)
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {tam > 0 && (
              <div className="p-4 bg-emerald-100 rounded-xl">
                <p className="text-sm text-emerald-800 mb-2">
                  <span className="font-bold">SAM = </span>
                  {formatMoney(tam)} × {data.samPercent}% 
                  = <span className="font-bold text-xl">{formatMoney(sam)}</span>
                </p>
                <p className="text-xs text-emerald-600">
                  This is the market segment you can realistically target with your current resources!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-3">Tips from Antler:</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• SAM narrows down TAM to the portion you can actually target</li>
              <li>• Consider your business model, resources, and geographic reach</li>
              <li>• Not everyone in TAM will need or afford your product</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentStep(2)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button 
              onClick={() => setCurrentStep(4)}
              disabled={!canProceedToStep(4)}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Next: SOM <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Step 3: Calculate Your SOM
            </h2>
            <p className="text-amber-800 mt-2">
              SOM = SAM × % market share you can realistically capture
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">
                Your SAM: <span className="font-bold">{formatMoney(sam)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What % of SAM can you realistically capture?
              </label>
              <input
                type="number"
                value={data.somPercent}
                onChange={(e) => setData(prev => ({ ...prev, somPercent: e.target.value }))}
                placeholder="e.g., 5"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                Consider: competition, marketing budget, sales team, product differentiation...
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[1, 3, 5, 10].map(pct => (
                <button
                  key={pct}
                  onClick={() => setData(prev => ({ ...prev, somPercent: String(pct) }))}
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    data.somPercent === String(pct)
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {sam > 0 && (
              <div className="p-4 bg-amber-100 rounded-xl">
                <p className="text-sm text-amber-800 mb-2">
                  <span className="font-bold">SOM = </span>
                  {formatMoney(sam)} × {data.somPercent}% 
                  = <span className="font-bold text-xl">{formatMoney(som)}</span>
                </p>
                <p className="text-xs text-amber-600">
                  This is what you can realistically achieve in the near term!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-3">Tips from Seer:</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Startups: 1-10% is realistic</li>
              <li>• Established companies: 20%+ is possible</li>
              <li>• Consider your competition and unique value proposition</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentStep(3)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button 
              onClick={() => setCurrentStep(5)}
              disabled={!canProceedToStep(5)}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              See Market Map <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Map className="h-6 w-6" />
              Your Market Map
            </h2>
            <p className="text-slate-300 mt-2">Here's your market visualized in 3D</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <p className="text-blue-100 text-sm mb-1">TAM</p>
              <p className="text-2xl font-bold text-white">{formatMoney(tam)}</p>
              <p className="text-blue-200 text-xs mt-2">Total Market</p>
            </div>
            <div className="bg-emerald-500 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <p className="text-emerald-100 text-sm mb-1">SAM</p>
              <p className="text-2xl font-bold text-white">{formatMoney(sam)}</p>
              <p className="text-emerald-200 text-xs mt-2">Serviceable</p>
            </div>
            <div className="bg-amber-500 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <p className="text-amber-100 text-sm mb-1">SOM</p>
              <p className="text-2xl font-bold text-white">{formatMoney(som)}</p>
              <p className="text-amber-200 text-xs mt-2">Obtainable</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center opacity-90">
                <span className="text-white font-bold">TAM</span>
              </div>
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center -ml-8 -mt-16 opacity-90">
                <span className="text-white font-bold">SAM</span>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center -ml-6 -mt-8">
                <span className="text-white text-xs font-bold">SOM</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500">Nested circles showing TAM → SAM → SOM</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Target Segment:</span> {data.targetSegment || "—"}</p>
              <p><span className="font-medium">Total Customers:</span> {data.totalCustomers ? parseInt(data.totalCustomers).toLocaleString() : "—"}</p>
              <p><span className="font-medium">Price per Customer:</span> {data.pricePerCustomer ? `$${data.pricePerCustomer}` : "—"}</p>
              <p><span className="font-medium">SAM %:</span> {data.samPercent}%</p>
              <p><span className="font-medium">SOM %:</span> {data.somPercent}%</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentStep(4)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button 
              onClick={saveData}
              disabled={saving}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Market Sizing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}