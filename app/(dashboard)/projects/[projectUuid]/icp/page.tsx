"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  Target,
  Building2,
  Globe,
  Users,
  TrendingUp,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  BarChart3,
  Calculator,
  Search,
  ListChecks,
  Crown,
  DollarSign,
  MapPin,
  Users2,
  Factory,
  Scale,
  BriefcaseIcon,
  Laptop,
  Mail,
  ShoppingCart,
  Building,
  Wallet,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { projectApi } from "@/features/projects/services/project-api";

interface ICPStep {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
}

interface ICPAttribute {
  id: string;
  category: string;
  label: string;
  value: string;
}

interface ICPMetric {
  id: string;
  name: string;
  currentValue: string;
  targetValue: string;
  unit: string;
}

interface ICPCustomer {
  id: string;
  name: string;
  reason: string;
  revenue: string;
  retention: string;
}

interface ICPScoring {
  id: string;
  category: string;
  attribute: string;
  weight: number;
  description: string;
}

interface ICPData {
  problem: string;
  icpDescription: string;
  steps: ICPStep[];
  customers: ICPCustomer[];
  attributes: ICPAttribute[];
  metrics: ICPMetric[];
  scoringRules: ICPScoring[];
  tam: string;
  sam: string;
  som: string;
  targetMarket: string;
  competitors: string[];
}

const defaultSteps: ICPStep[] = [
  { id: 1, title: "Analyze Best Customers", description: "Who are your top 20% customers?" },
  { id: 2, title: "Find Patterns", description: "What patterns do you see?" },
  { id: 3, title: "Define Attributes", description: "Build your ICP profile" },
  { id: 4, title: "Create Scoring", description: "Score & prioritize accounts" }
];

export default function ICPPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ICPData>({
    problem: "",
    icpDescription: "",
    steps: defaultSteps,
    customers: [],
    attributes: [],
    metrics: [],
    scoringRules: [],
    tam: "",
    sam: "",
    som: "",
    targetMarket: "",
    competitors: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: "", reason: "", revenue: "", retention: "" });
  const [newAttribute, setNewAttribute] = useState({ category: "firmographic", label: "", value: "" });
  const [newMetric, setNewMetric] = useState({ name: "", currentValue: "", targetValue: "", unit: "%" });
  const [newScoring, setNewScoring] = useState({ category: "firmographic", attribute: "", weight: 20, description: "" });

  const attributeCategories = [
    { id: "firmographic", name: "Firmographic", icon: Building2, color: "blue", fields: ["Industry", "Company Size", "Revenue", "Geography", "Funding Stage"] },
    { id: "technographic", name: "Technographic", icon: Laptop, color: "violet", fields: ["Tools", "Platforms", "Integrations", "Tech Stack"] },
    { id: "behavioral", name: "Behavioral", icon: TrendingUp, color: "emerald", fields: ["Buying Behavior", "Pain Points", "Goals", "Decision Process"] },
    { id: "qualitative", name: "Qualitative", icon: Star, color: "amber", fields: ["Culture", "Values", "Leadership Style", "Innovation appetite"] }
  ];

  useEffect(() => {
    if (!projectUuid) return;
    loadICP();
  }, [projectUuid]);

  async function loadICP() {
    try {
      const result = await projectApi.getICP(projectUuid);
      if (result && typeof result === 'object') {
        const apiData = result as any;
        setData({
          problem: apiData.problem || "",
          icpDescription: apiData.icpDescription || "",
          steps: apiData.steps || defaultSteps,
          customers: apiData.customers || [],
          attributes: apiData.attributes || [],
          metrics: apiData.metrics || [],
          scoringRules: apiData.scoringRules || [],
          tam: apiData.tam || "",
          sam: apiData.sam || "",
          som: apiData.som || "",
          targetMarket: apiData.targetMarket || "",
          competitors: apiData.competitors || []
        });
      }
    } catch (error: any) {
      console.error("Load ICP error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveICP() {
    setSaving(true);
    try {
      await projectApi.saveICP(projectUuid, data as unknown as Record<string, unknown>);
      alert("ICP saved!");
    } catch (error: any) {
      console.error("Save ICP error:", error);
    } finally {
      setSaving(false);
    }
  }

  function completeStep(stepId: number) {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, completed: true } : s)
    }));
    if (stepId === currentStep && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }

  function addCustomer() {
    if (!newCustomer.name.trim()) return;
    setData(prev => ({
      ...prev,
      customers: [...prev.customers, { ...newCustomer, id: Date.now().toString() }]
    }));
    setNewCustomer({ name: "", reason: "", revenue: "", retention: "" });
  }

  function addAttribute() {
    if (!newAttribute.label.trim() || !newAttribute.value.trim()) return;
    setData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute, id: Date.now().toString() }]
    }));
    setNewAttribute({ category: "firmographic", label: "", value: "" });
  }

  function addMetric() {
    if (!newMetric.name.trim()) return;
    setData(prev => ({
      ...prev,
      metrics: [...prev.metrics, { ...newMetric, id: Date.now().toString() }]
    }));
    setNewMetric({ name: "", currentValue: "", targetValue: "", unit: "%" });
  }

  function addScoringRule() {
    if (!newScoring.attribute.trim()) return;
    setData(prev => ({
      ...prev,
      scoringRules: [...prev.scoringRules, { ...newScoring, id: Date.now().toString() }]
    }));
    setNewScoring({ category: "firmographic", attribute: "", weight: 20, description: "" });
  }

  function removeItem(type: string, id: string) {
    setData(prev => ({
      ...prev,
      [type]: (prev as any)[type].filter((item: any) => item.id !== id)
    }));
  }

  function calculateMetricsFromData() {
    if (data.customers.length === 0) return null;

    const totalRevenue = data.customers.reduce((sum, c) => {
      const val = parseFloat(c.revenue.replace(/[^0-9.]/g, '')) || 0;
      return sum + val;
    }, 0);

    const avgRetention = data.customers.reduce((sum, c) => {
      const val = parseFloat(c.retention.replace(/[^0-9.]/g, '')) || 0;
      return sum + val;
    }, 0) / data.customers.length;

    return { avgRevenue: totalRevenue / data.customers.length, avgRetention };
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Step 1: Analyze Your Best Customers
              </h3>
              <p className="text-blue-700 text-sm">
                Think about your top 20% customers who generate the most revenue and stay the longest.
                Add at least 3-5 examples to find meaningful patterns.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Your Best Customers</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Annual Revenue</label>
                    <input
                      type="text"
                      value={newCustomer.revenue}
                      onChange={(e) => setNewCustomer({ ...newCustomer, revenue: e.target.value })}
                      placeholder="$100,000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Why They Buy From You</label>
                    <input
                      type="text"
                      value={newCustomer.reason}
                      onChange={(e) => setNewCustomer({ ...newCustomer, reason: e.target.value })}
                      placeholder="Fast support, Great features..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Retention (months)</label>
                    <input
                      type="text"
                      value={newCustomer.retention}
                      onChange={(e) => setNewCustomer({ ...newCustomer, retention: e.target.value })}
                      placeholder="24 months"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  onClick={addCustomer}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Customer
                </button>
              </div>

              {data.customers.length > 0 && (
                <div className="mt-6 space-y-3">
                  {data.customers.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.revenue} • {customer.reason}</p>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">{customer.retention}</span>
                      <button onClick={() => removeItem('customers', customer.id)} className="p-1 hover:bg-red-100 rounded">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {data.customers.length >= 3 && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 inline mr-2" />
                  Great! You have {data.customers.length} customers. Ready to find patterns?
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
              <h3 className="font-bold text-lg text-violet-900 mb-2 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Step 2: Find Patterns
              </h3>
              <p className="text-violet-700 text-sm">
                Look for common patterns among your best customers. What do they have in common?
              </p>
            </div>

            {data.customers.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Pattern Analysis</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {attributeCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className="bg-slate-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 text-${cat.color}-600`} />
                            <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                          </div>
                          <input
                            type="text"
                            placeholder={`e.g., ${cat.fields[0]}`}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            onChange={(e) => {
                              const attr = data.attributes.find(a => a.category === cat.id);
                              if (attr) {
                                setData(prev => ({
                                  ...prev,
                                  attributes: prev.attributes.map(a => 
                                    a.category === cat.id ? { ...a, value: e.target.value } : a
                                  )
                                }));
                              } else {
                                setData(prev => ({
                                  ...prev,
                                  attributes: [...prev.attributes, { id: cat.id, category: cat.id, label: cat.fields[0], value: e.target.value }]
                                }));
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm text-amber-700">
                  Add customers in Step 1 first to analyze patterns.
                </p>
              </div>
            )}

            {calculateMetricsFromData() && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Auto-calculated Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-xs text-emerald-600 mb-1">Avg Revenue/Customer</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      ${calculateMetricsFromData()?.avgRevenue.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 mb-1">Avg Retention</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {calculateMetricsFromData()?.avgRetention.toFixed(0) || 0} months
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="font-bold text-lg text-emerald-900 mb-2 flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Step 3: Define ICP Attributes
              </h3>
              <p className="text-emerald-700 text-sm">
                Document the attributes that define your ideal customer profile.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {attributeCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className={`bg-gradient-to-br from-${cat.color}-50 to-${cat.color}-100 rounded-2xl border border-${cat.color}-200 p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className={`h-5 w-5 text-${cat.color}-600`} />
                      <h4 className={`font-semibold text-${cat.color}-900`}>{cat.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {cat.fields.map((field) => {
                        const existingAttr = data.attributes.find(a => a.label === field && a.category === cat.id);
                        return (
                          <div key={field} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={field}
                              value={existingAttr?.value || ""}
                              onChange={(e) => {
                                if (existingAttr) {
                                  setData(prev => ({
                                    ...prev,
                                    attributes: prev.attributes.map(a => 
                                      a.id === existingAttr.id ? { ...a, value: e.target.value } : a
                                    )
                                  }));
                                } else {
                                  setData(prev => ({
                                    ...prev,
                                    attributes: [...prev.attributes, { 
                                      id: `${cat.id}-${field}`, 
                                      category: cat.id, 
                                      label: field, 
                                      value: e.target.value 
                                    }]
                                  }));
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-white/80 border border-transparent rounded-lg text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-bold text-lg text-amber-900 mb-2 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Step 4: Create Scoring System
              </h3>
              <p className="text-amber-700 text-sm">
                Build a scoring system to rank and prioritize accounts against your ICP.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Scoring Criteria</h4>
              <div className="space-y-3">
                {data.scoringRules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calculator className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No scoring rules yet. Add rules to score accounts.</p>
                  </div>
                ) : (
                  data.scoringRules.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="font-bold text-amber-700">{rule.weight}%</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{rule.attribute}</p>
                        <p className="text-xs text-slate-500">{rule.category} • {rule.description}</p>
                      </div>
                      <button onClick={() => removeItem('scoringRules', rule.id)} className="p-1 hover:bg-red-100 rounded">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                    <select
                      value={newScoring.category}
                      onChange={(e) => setNewScoring({ ...newScoring, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="firmographic">Firmographic</option>
                      <option value="technographic">Technographic</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="qualitative">Qualitative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Attribute</label>
                    <input
                      type="text"
                      value={newScoring.attribute}
                      onChange={(e) => setNewScoring({ ...newScoring, attribute: e.target.value })}
                      placeholder="e.g., Industry match"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      value={newScoring.weight}
                      onChange={(e) => setNewScoring({ ...newScoring, weight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <input
                      type="text"
                      value={newScoring.description}
                      onChange={(e) => setNewScoring({ ...newScoring, description: e.target.value })}
                      placeholder="Optional note"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addScoringRule}
                  className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Rule
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <h4 className="font-bold text-emerald-900 mb-3">Your ICP Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.customers.length}</p>
                  <p className="text-xs text-emerald-700">Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.attributes.length}</p>
                  <p className="text-xs text-emerald-700">Attributes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.scoringRules.length}</p>
                  <p className="text-xs text-emerald-700">Rules</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.som || "-"}</p>
                  <p className="text-xs text-emerald-700">SOM</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ICP Builder</h1>
          <p className="text-slate-500 text-sm mt-1">Build your Ideal Customer Profile in 4 steps</p>
        </div>
        <button onClick={saveICP} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                currentStep === step
                  ? "bg-slate-900 text-white"
                  : data.steps.find(s => s.id === step)?.completed
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {data.steps.find(s => s.id === step)?.completed ? <Check className="h-5 w-5" /> : step}
            </button>
            {step < 4 && <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />}
          </div>
        ))}
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">{data.steps.find(s => s.id === currentStep)?.title}</h2>
          <p className="text-sm text-slate-600">{data.steps.find(s => s.id === currentStep)?.description}</p>
        </div>

        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 inline mr-2" />
          Previous
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
          >
            Next
            <ArrowRight className="h-4 w-4 inline ml-2" />
          </button>
        ) : (
          <button
            onClick={saveICP}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            <CheckCircle2 className="h-4 w-4 inline mr-2" />
            Complete ICP
          </button>
        )}
      </div>
    </div>
  );
}
