"use client";

import { useEffect, useState, type ComponentType, type DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  X, 
  GripVertical,
  Trash2,
  Save,
  Layers,
  Users,
  Megaphone,
  Handshake,
  Wallet,
  Settings,
  Truck,
  TrendingDown,
  Lightbulb
} from "lucide-react";
import { projectApi } from "@/features/projects/services/project-api";

interface BMCBlock {
  id: string;
  title: string;
  items: BMCItem[];
  color: string;
  borderColor: string;
}

interface BMCItem {
  id: string;
  title: string;
  description?: string;
  addedAt?: string;
  movedAt?: string;
  editedAt?: string;
  addedBy?: {
    id: number;
    name: string;
    initials: string;
  };
  movedBy?: {
    id: number;
    name: string;
    initials: string;
  };
  editedBy?: {
    id: number;
    name: string;
    initials: string;
  };
}

const bmcBlocks: BMCBlock[] = [
  { 
    id: "customer_segments", 
    title: "Customer Segments", 
    items: [], 
    color: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  { 
    id: "value_propositions", 
    title: "Value Propositions", 
    items: [], 
    color: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  { 
    id: "channels", 
    title: "Channels", 
    items: [], 
    color: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  { 
    id: "customer_relationships", 
    title: "Customer Relationships", 
    items: [], 
    color: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  { 
    id: "revenue_streams", 
    title: "Revenue Streams", 
    items: [], 
    color: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  { 
    id: "key_resources", 
    title: "Key Resources", 
    items: [], 
    color: "bg-rose-50",
    borderColor: "border-rose-200"
  },
  { 
    id: "key_activities", 
    title: "Key Activities", 
    items: [], 
    color: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  { 
    id: "key_partnerships", 
    title: "Key Partnerships", 
    items: [], 
    color: "bg-slate-50",
    borderColor: "border-slate-200"
  },
  { 
    id: "cost_structure", 
    title: "Cost Structure", 
    items: [], 
    color: "bg-red-50",
    borderColor: "border-red-200"
  }
];

const blockIcons: Record<string, ComponentType<{ className?: string }>> = {
  customer_segments: Users,
  value_propositions: Lightbulb,
  channels: Truck,
  customer_relationships: Handshake,
  revenue_streams: Wallet,
  key_resources: Layers,
  key_activities: Settings,
  key_partnerships: Megaphone,
  cost_structure: TrendingDown
};

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;
  
  const [blocks, setBlocks] = useState<BMCBlock[]>(bmcBlocks);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [viewItem, setViewItem] = useState<BMCItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [draggedItem, setDraggedItem] = useState<{ blockId: string; itemId: string } | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  useEffect(() => {
    if (!projectUuid) return;
    loadBMC();
  }, [projectUuid]);

  async function loadBMC() {
    try {
      const response = await projectApi.getBMC(projectUuid);
      const data = (response as any)?.items || response;
      const blockOrder = (response as any)?.blockOrder;
      
      if (data && typeof data === 'object') {
        const rawBlocks = blockOrder 
          ? blockOrder.map((key: string) => {
              const existingBlock = bmcBlocks.find(b => b.id === key);
              return existingBlock || { id: key, title: key, items: [], color: 'bg-slate-50', borderColor: 'border-slate-200' };
            })
          : bmcBlocks;
          
        setBlocks(prev => prev.map(block => {
          const rawItems = data[block.id] || [];
          return {
            ...block,
            items: rawItems.map((item: any) => ({
              id: item.id,
              title: item.title || item.content,
              description: item.description,
              addedAt: item.addedAt,
              movedAt: item.movedAt,
              editedAt: item.editedAt,
              addedBy: item.addedBy,
              movedBy: item.movedBy,
              editedBy: item.editedBy
            }))
          };
        }));
      }
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveBMC() {
    try {
      const data: Record<string, { id: string; title: string; description?: string }[]> = {};
      blocks.forEach(block => {
        data[block.id] = block.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description
        }));
      });
      await projectApi.saveBMC(projectUuid, data);
      alert("Business Model saved!");
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
        return;
      }
      
    }
  }

  function saveEdit() {
    if (!viewItem || !editTitle.trim()) return;
    
    const now = new Date().toISOString();
    const mockUser = { id: 1, name: "You", initials: "YO" };
    
    setBlocks(prev => prev.map(block => ({
      ...block,
      items: block.items.map(item => 
        item.id === viewItem.id 
          ? { 
              ...item, 
              title: editTitle, 
              description: editDescription || undefined,
              editedAt: now,
              editedBy: mockUser
            }
          : item
      )
    })));
    
    setViewItem(prev => prev ? {
      ...prev,
      title: editTitle,
      description: editDescription || undefined,
      editedAt: now,
      editedBy: { id: 1, name: "You", initials: "YO" }
    } : null);
    
    setIsEditing(false);
  }

  function addItem(blockId: string) {
    if (!newItemContent.trim()) return;
    
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const newItem: BMCItem = {
          id: Date.now().toString(),
          title: newItemContent,
          description: newItemDescription || undefined
        };
        return {
          ...block,
          items: [...block.items, newItem]
        };
      }
      return block;
    }));
    
    setNewItemContent("");
    setNewItemDescription("");
    setShowAddModal(null);
  }

  function removeItem(blockId: string, itemId: string) {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          items: block.items.filter(item => item.id !== itemId)
        };
      }
      return block;
    }));
  }

  function handleDragStart(blockId: string, itemId: string) {
    setDraggedItem({ blockId, itemId });
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetBlockId: string) {
    if (!draggedItem) return;
    if (draggedItem.blockId === targetBlockId) return;

    const sourceBlock = blocks.find(b => b.id === draggedItem.blockId);
    const targetBlock = blocks.find(b => b.id === targetBlockId);
    
    if (!sourceBlock || !targetBlock) return;

    const itemToMove = sourceBlock.items.find(i => i.id === draggedItem.itemId);
    if (!itemToMove) return;
    
    const now = new Date().toISOString();

    setBlocks(prev => prev.map(block => {
      if (block.id === draggedItem.blockId) {
        return { ...block, items: block.items.filter(i => i.id !== draggedItem.itemId) };
      }
      if (block.id === targetBlockId) {
        return { ...block, items: [...block.items, { 
          ...itemToMove, 
          id: Date.now().toString(),
          movedAt: now
        }] };
      }
      return block;
    }));

    setDraggedItem(null);
  }

  function handleBlockDragStart(blockId: string) {
    setDraggedBlock(blockId);
  }

  function handleBlockDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleBlockDrop(targetBlockId: string) {
    if (!draggedBlock || draggedBlock === targetBlockId) return;
    
    setBlocks(prev => {
      const draggedIndex = prev.findIndex(b => b.id === draggedBlock);
      const targetIndex = prev.findIndex(b => b.id === targetBlockId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newBlocks = [...prev];
      const [removed] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(targetIndex, 0, removed);
      return newBlocks;
    });
    
    setDraggedBlock(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Model Canvas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Define your business model with the BMC framework
          </p>
        </div>
        <Button onClick={saveBMC} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {blocks.map((block) => {
          const Icon = blockIcons[block.id];
          return (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleBlockDragStart(block.id)}
              onDragOver={handleBlockDragOver}
              onDrop={() => handleBlockDrop(block.id)}
              className={`${block.color} rounded-xl border-2 ${block.borderColor} p-4 min-h-[200px] transition-all ${draggedBlock === block.id ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex items-center justify-between mb-3 cursor-move">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${block.borderColor.replace('border-', 'text-')}`} />
                  <h3 className="font-semibold text-slate-800 text-sm">{block.title}</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(block.id)}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              <div className="space-y-2">
                {block.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(block.id, item.id)}
                    onClick={() => setViewItem(item)}
                    className="group flex flex-col gap-1 bg-white rounded-lg p-2 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 flex-1">{item.title}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeItem(block.id, item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                {block.items.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm italic">
                    Add an item...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Add Item
              </h3>
              <button onClick={() => setShowAddModal(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <Input
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Item title..."
                  className="border-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  rows={3}
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => addItem(showAddModal)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddModal(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setViewItem(null); setIsEditing(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? "Edit" : viewItem.title}
                </h3>
                <button onClick={() => { setViewItem(null); setIsEditing(false); }} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Title
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {viewItem.description && (
                    <div className="mb-6">
                      <p className="text-slate-600 whitespace-pre-wrap">{viewItem.description}</p>
                    </div>
                  )}
                </>
              )}
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Activity
                </h4>
                <div className="relative">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                  <div className="space-y-4">
                    {viewItem.addedAt && (
                      <div className="relative flex items-start gap-3 ml-1">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10"></span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            <span className="text-emerald-600 font-semibold">{viewItem.addedBy?.initials || "#" + viewItem.addedBy?.id}</span>
                            <span className="text-slate-500"> created</span>
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(viewItem.addedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                    {viewItem.editedAt && (
                      <div className="relative flex items-start gap-3 ml-1">
                        <span className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm z-10"></span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            <span className="text-amber-600 font-semibold">{viewItem.editedBy?.initials || "#" + viewItem.editedBy?.id}</span>
                            <span className="text-slate-500"> edited</span>
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(viewItem.editedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                    {viewItem.movedAt && (
                      <div className="relative flex items-start gap-3 ml-1">
                        <span className="w-3 h-3 bg-violet-500 rounded-full border-2 border-white shadow-sm z-10"></span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            <span className="text-violet-600 font-semibold">{viewItem.movedBy?.initials || "#" + viewItem.movedBy?.id}</span>
                            <span className="text-slate-500"> moved</span>
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(viewItem.movedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                {isEditing ? (
                  <>
                    <Button onClick={saveEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 border border-slate-200">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => { setEditTitle(viewItem.title); setEditDescription(viewItem.description || ""); setIsEditing(true); }} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => { setViewItem(null); setIsEditing(false); }} className="flex-1 border border-slate-200">
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
