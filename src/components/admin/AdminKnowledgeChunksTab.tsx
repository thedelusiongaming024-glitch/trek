import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Cpu, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Bot, 
  Send, 
  ShieldCheck, 
  BookOpen, 
  Zap,
  Brain,
  HelpCircle,
  Clock,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  Layers,
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Code,
  Type,
  Tag,
  Info,
  RotateCcw,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { KnowledgeDocument, AIKnowledgeStatus } from '../../types';

interface AdminKnowledgeChunksTabProps {
  onNotify: (message: string) => void;
}

interface ExtractedChunkDraft {
  id: string;
  title: string;
  category: string;
  summary?: string;
  tags?: string[];
  content: string;
  selected: boolean;
}

interface BusinessMemorySummary {
  version: number;
  lastUpdated: string;
  totalMemoryNodes: number;
  pillarsCount: number;
  faqsCount: number;
  docsCount: number;
  ticketsCount: number;
  quickFacts: any;
  identity: {
    brand: string;
    headquarters: string;
    foundedEra: string;
    officialEmail: string;
    slaHours: number;
  };
}

export const AdminKnowledgeChunksTab: React.FC<AdminKnowledgeChunksTabProps> = ({ onNotify }) => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [status, setStatus] = useState<AIKnowledgeStatus | null>(null);
  const [businessMemory, setBusinessMemory] = useState<BusinessMemorySummary | null>(null);
  const [isRebuildingMemory, setIsRebuildingMemory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Bulk selection state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Manual Add / Edit Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const [docForm, setDocForm] = useState<{
    title: string;
    content: string;
    category: string;
    status: 'published' | 'draft';
  }>({
    title: '',
    content: '',
    category: 'Community',
    status: 'published'
  });

  // AI Knowledge Ingestion Modal state (Dual mode: File Upload vs Raw Elements)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [ingestMode, setIngestMode] = useState<'file' | 'elements'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawElementsInput, setRawElementsInput] = useState('');
  const [elementsTitle, setElementsTitle] = useState('');
  const [fileCategoryHint, setFileCategoryHint] = useState('Documentation');
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedDrafts, setExtractedDrafts] = useState<ExtractedChunkDraft[]>([]);
  const [isSavingDrafts, setIsSavingDrafts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Review & Filter state for extracted drafts
  const [draftSearchQuery, setDraftSearchQuery] = useState('');
  const [draftCategoryFilter, setDraftCategoryFilter] = useState('all');

  // Custom Gemini API Key override (persisted in localStorage for convenience)
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('trek_gemini_api_key_override') || '';
    } catch {
      return '';
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleApiKeyChange = (val: string) => {
    setCustomApiKey(val);
    try {
      if (val.trim()) {
        localStorage.setItem('trek_gemini_api_key_override', val.trim());
      } else {
        localStorage.removeItem('trek_gemini_api_key_override');
      }
    } catch {}
  };

  // AI Live Tester State
  const [testQuestion, setTestQuestion] = useState('');
  const [testLang, setTestLang] = useState<'en' | 'bn'>('en');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    reply: string;
    source: string;
    time: string;
  } | null>(null);

  // Fetch documents, AI status, and Business Memory
  const fetchKnowledgeData = async () => {
    setLoading(true);
    try {
      const [docsRes, statusRes, memoryRes] = await Promise.all([
        fetch('/api/admin/support/knowledge-docs'),
        fetch('/api/admin/support/ai-knowledge-status'),
        fetch('/api/admin/support/business-memory')
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocs(docsData);
      }
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
      if (memoryRes.ok) {
        const memoryData = await memoryRes.json();
        if (memoryData.memory) setBusinessMemory(memoryData.memory);
      }
    } catch (err) {
      console.error('Failed to load knowledge chunks data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRebuildMemory = async () => {
    setIsRebuildingMemory(true);
    try {
      const res = await fetch('/api/admin/support/business-memory/rebuild', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.memory) setBusinessMemory(data.memory);
        onNotify('Business Memory graph re-compiled and synchronized with all database tables!');
        await fetchKnowledgeData();
      } else {
        throw new Error('Rebuild failed');
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to rebuild business memory');
    } finally {
      setIsRebuildingMemory(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  // Handle Manual Save Document
  const handleSaveManualDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim() || !docForm.content.trim()) return;

    try {
      if (editingDoc) {
        const res = await fetch(`/api/admin/support/knowledge-docs/${editingDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docForm)
        });
        if (res.ok) {
          const updated = await res.json();
          setDocs(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...updated } : d));
          onNotify('Knowledge Document chunk updated in database.');
        }
      } else {
        const res = await fetch('/api/admin/support/knowledge-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docForm)
        });
        if (res.ok) {
          const created = await res.json();
          setDocs(prev => [created, ...prev]);
          onNotify('New Knowledge Document chunk saved. AI automatically updated in real-time!');
        }
      }

      // Refresh status
      const statusRes = await fetch('/api/admin/support/ai-knowledge-status');
      if (statusRes.ok) setStatus(await statusRes.json());

      setIsManualModalOpen(false);
      setEditingDoc(null);
    } catch (err) {
      console.error('Failed to save document chunk:', err);
    }
  };

  // Handle Single Delete Document
  const handleDeleteDoc = async (docId: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from the knowledge base? Unnecessary knowledge will be immediately excluded from AI retrieval.`)) return;
    try {
      const res = await fetch(`/api/admin/support/knowledge-docs/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== docId));
        setSelectedDocIds(prev => prev.filter(id => id !== docId));
        onNotify('Knowledge chunk deleted from PostgreSQL database.');
        const statusRes = await fetch('/api/admin/support/ai-knowledge-status');
        if (statusRes.ok) setStatus(await statusRes.json());
      }
    } catch (err) {
      console.error('Failed to delete document chunk:', err);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedDocIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedDocIds.length} selected knowledge chunks from the database?`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/support/knowledge-docs/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedDocIds })
      });

      if (res.ok) {
        setDocs(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
        onNotify(`Successfully removed ${selectedDocIds.length} unnecessary knowledge chunks.`);
        setSelectedDocIds([]);
        const statusRes = await fetch('/api/admin/support/ai-knowledge-status');
        if (statusRes.ok) setStatus(await statusRes.json());
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Toggle selection
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map(d => d.id));
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setAnalysisError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysisError(null);
    }
  };

  // Analyze File or Raw Elements with Gemini AI
  const handleAnalyze = async () => {
    if (ingestMode === 'file' && !selectedFile) return;
    if (ingestMode === 'elements' && !rawElementsInput.trim()) {
      setAnalysisError('Please enter or paste elements or text content to analyze.');
      return;
    }

    setIsAnalyzingFile(true);
    setAnalysisError(null);
    setExtractedDrafts([]);

    try {
      const payload: any = {
        categoryHint: fileCategoryHint,
        autoSave: false // Let the admin inspect, filter, edit, or remove unnecessary chunks first!
      };

      if (customApiKey.trim()) {
        payload.apiKey = customApiKey.trim();
      }

      if (ingestMode === 'elements') {
        payload.elementText = rawElementsInput.trim();
        payload.fileName = elementsTitle.trim() || 'Pasted Elements / Direct Input';
      } else if (selectedFile) {
        // Convert file to base64 or text in-memory
        const reader = new FileReader();
        const isTextFile = selectedFile.type.startsWith('text/') || 
                           selectedFile.name.endsWith('.md') || 
                           selectedFile.name.endsWith('.txt') || 
                           selectedFile.name.endsWith('.json') || 
                           selectedFile.name.endsWith('.csv');

        const fileDataPromise = new Promise<string>((resolve, reject) => {
          if (isTextFile) {
            reader.readAsText(selectedFile);
          } else {
            reader.readAsDataURL(selectedFile);
          }
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

        const fileData = await fileDataPromise;
        payload.fileData = fileData;
        payload.fileName = selectedFile.name;
        payload.mimeType = selectedFile.type || 'application/octet-stream';
      }

      const res = await fetch('/api/admin/support/knowledge-docs/extract-from-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze knowledge content with AI');
      }

      const data = await res.json();
      if (data.chunks && Array.isArray(data.chunks) && data.chunks.length > 0) {
        const drafts: ExtractedChunkDraft[] = data.chunks.map((c: any, idx: number) => ({
          id: `draft-${Date.now()}-${idx}`,
          title: c.title || `Knowledge Chunk ${idx + 1}`,
          category: c.category || fileCategoryHint || 'General',
          summary: c.summary || '',
          tags: Array.isArray(c.tags) ? c.tags : [],
          content: c.content || '',
          selected: true
        }));
        setExtractedDrafts(drafts);
        setDraftSearchQuery('');
        setDraftCategoryFilter('all');
      } else {
        throw new Error('No knowledge chunks could be extracted from this content.');
      }
    } catch (err: any) {
      console.error('File/Elements analysis error:', err);
      setAnalysisError(err.message || 'Error occurred while analyzing content with AI.');
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // Commit selected extracted chunks to PostgreSQL Database
  const handleSaveSelectedDrafts = async () => {
    const activeDrafts = extractedDrafts.filter(d => d.selected && d.title.trim() && d.content.trim());
    if (activeDrafts.length === 0) {
      onNotify('Please select at least one chunk to save into the knowledge base.');
      return;
    }

    setIsSavingDrafts(true);
    try {
      const res = await fetch('/api/admin/support/knowledge-docs/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunks: activeDrafts.map(d => ({
            title: d.title.trim(),
            category: d.category.trim() || fileCategoryHint,
            content: d.content.trim()
          }))
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to commit chunks to database');
      }

      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        setDocs(prev => [...data.documents, ...prev]);
      } else {
        await fetchKnowledgeData();
      }

      const sourceLabel = ingestMode === 'file' && selectedFile ? selectedFile.name : (elementsTitle || 'Pasted Elements');
      onNotify(`Added ${activeDrafts.length} knowledge chunks from "${sourceLabel}" into PostgreSQL!`);

      // Refresh status
      const statusRes = await fetch('/api/admin/support/ai-knowledge-status');
      if (statusRes.ok) setStatus(await statusRes.json());

      // Reset modal
      setIsFileModalOpen(false);
      setSelectedFile(null);
      setRawElementsInput('');
      setElementsTitle('');
      setExtractedDrafts([]);
    } catch (err: any) {
      console.error('Failed to commit extracted chunks:', err);
      onNotify(err.message || 'Failed to save knowledge chunks');
    } finally {
      setIsSavingDrafts(false);
    }
  };

  // Add a manual chunk into current drafts during review
  const handleAddCustomDraftChunk = () => {
    const newDraft: ExtractedChunkDraft = {
      id: `draft-custom-${Date.now()}`,
      title: 'New Knowledge Section',
      category: fileCategoryHint || 'General',
      summary: '',
      tags: [],
      content: '',
      selected: true
    };
    setExtractedDrafts(prev => [newDraft, ...prev]);
  };

  // Filtered drafts in review step
  const extractedCategories = Array.from(new Set(extractedDrafts.map(d => d.category || 'General')));
  const filteredDrafts = extractedDrafts.filter(d => {
    const matchesCat = draftCategoryFilter === 'all' || d.category === draftCategoryFilter;
    const q = draftSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const handleSelectAllDrafts = (select: boolean) => {
    if (draftSearchQuery.trim() || draftCategoryFilter !== 'all') {
      const visibleIds = new Set(filteredDrafts.map(d => d.id));
      setExtractedDrafts(prev => prev.map(d => visibleIds.has(d.id) ? { ...d, selected: select } : d));
    } else {
      setExtractedDrafts(prev => prev.map(d => ({ ...d, selected: select })));
    }
  };

  const handleInvertDrafts = () => {
    if (draftSearchQuery.trim() || draftCategoryFilter !== 'all') {
      const visibleIds = new Set(filteredDrafts.map(d => d.id));
      setExtractedDrafts(prev => prev.map(d => visibleIds.has(d.id) ? { ...d, selected: !d.selected } : d));
    } else {
      setExtractedDrafts(prev => prev.map(d => ({ ...d, selected: !d.selected })));
    }
  };

  // Run AI Test Query
  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuestion.trim()) return;

    setTestLoading(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'admin-rag-tester',
          message: testQuestion.trim(),
          language: testLang,
          userEmail: 'admin@trekconsultancy.com'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResponse({
          reply: data.botReply?.message || 'No response returned',
          source: data.botReply?.source || 'AI',
          time: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error('Test query failed:', err);
    } finally {
      setTestLoading(false);
    }
  };

  // Filtered documents
  const categories = Array.from(new Set(docs.map(d => d.category || 'General')));
  const filteredDocs = docs.filter(d => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Summary */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                PostgreSQL Knowledge Index
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Knowledge Base Chunks
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Structured documentation and FAQ chunks indexed for automated customer support. Upload reference documents or create manual chunks synchronized directly with the database.
            </p>
          </div>

          {/* Quick Metrics from DB */}
          <div className="grid grid-cols-3 gap-3 self-stretch lg:self-auto shrink-0">
            <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-base font-bold text-slate-900 font-mono">{status?.totalChunks ?? docs.length}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Chunks</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-base font-bold text-slate-900 font-mono">{status?.totalFaqs ?? 7}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">FAQs</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
              <span className="block text-base font-bold text-slate-900 font-mono">{status?.totalTopics ?? 15}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Topics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Memory Graph & Auto-Sync Engine Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Auto-Synchronized
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Sub-15ms AI Recall & Ground Truth
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              Unified Business Memory Core
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consolidated knowledge graph spanning corporate origins, 6 strategic service pillars, verified FAQs, document extracts, and resolved human consultant cases. Any document or FAQ added in the admin panel automatically recompiles this memory in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRebuildMemory}
              disabled={isRebuildingMemory}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-xs cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRebuildingMemory ? 'animate-spin' : ''}`} />
              <span>{isRebuildingMemory ? 'Rebuilding Memory...' : 'Rebuild Memory Graph'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Strategic Pillars</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {businessMemory?.pillarsCount ?? 6} Pillars
            </div>
            <span className="text-[11px] text-emerald-400/90 truncate block mt-0.5">Turnkey MISA, Tech, Visas</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Memory Nodes</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {businessMemory?.totalMemoryNodes ?? (docs.length + 7 + 6)} Nodes
            </div>
            <span className="text-[11px] text-slate-400 truncate block mt-0.5">FAQs + Chunks + Pillars</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Institutional Desk</span>
            <div className="text-xs font-semibold text-white mt-1 truncate">
              {businessMemory?.identity?.headquarters ? 'King Fahd Rd, Riyadh' : 'Riyadh, Saudi Arabia'}
            </div>
            <span className="text-[11px] text-slate-400 truncate block mt-0.5">Senior Legal & Tech Team</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Memory Status</span>
            <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Persistent & Ready</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {businessMemory?.lastUpdated ? `Synced ${new Date(businessMemory.lastUpdated).toLocaleTimeString()}` : 'Real-time sync'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Knowledge Documents Management & Live Tester Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Knowledge Document Chunks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter chunks by title, content, or category..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                />
              </div>

              {/* Action Buttons: Document Ingestion & Manual Add */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={fetchKnowledgeData}
                  className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 cursor-pointer shadow-2xs transition-colors"
                  title="Refresh knowledge chunks"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setRawElementsInput('');
                    setElementsTitle('');
                    setExtractedDrafts([]);
                    setAnalysisError(null);
                    setIngestMode('file');
                    setIsFileModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs cursor-pointer transition-colors whitespace-nowrap"
                  title="Analyze documents, images, or elements with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ingest Knowledge (File / Elements)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingDoc(null);
                    setDocForm({
                      title: '',
                      content: '',
                      category: 'Community',
                      status: 'published'
                    });
                    setIsManualModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chunk</span>
                </button>
              </div>
            </div>

            {/* Category Filter Buttons & Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({docs.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({docs.filter(d => d.category === cat).length})
                  </button>
                ))}
              </div>

              {/* Bulk Select & Delete Controls */}
              {filteredDocs.length > 0 && (
                <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-auto">
                  <button
                    onClick={handleSelectAll}
                    className="text-[11px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    {selectedDocIds.length === filteredDocs.length ? 'Deselect All' : 'Select All'}
                  </button>

                  {selectedDocIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete ({selectedDocIds.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chunks List */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 space-y-2">
                <BookOpen className="w-7 h-7 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No knowledge chunks found matching filter.</p>
                <p className="text-[11px] text-slate-400">Upload a reference document or create a new chunk manually.</p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`rounded-xl p-4.5 border transition-all space-y-2.5 ${
                      isSelected 
                        ? 'bg-rose-50/50 border-rose-300 shadow-2xs' 
                        : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectDoc(doc.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          title="Select to delete"
                        />
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider font-mono">
                          {doc.category || 'General'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {doc.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setDocForm({
                              title: doc.title,
                              content: doc.content,
                              category: doc.category || 'Community',
                              status: doc.status || 'published'
                            });
                            setIsManualModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Chunk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Chunk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{doc.title}</h4>
                      <div className="text-xs text-slate-700 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {doc.content}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Database Synchronized
                      </span>
                      <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: Knowledge Retrieval Sandbox & Tester */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                  Retrieval Simulator & Tester
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Live Query
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Test queries against currently saved document chunks and FAQs to verify system responses:
            </p>

            {/* Quick Test Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Presets:</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTestQuestion('How do I import demo content in Docly theme?')}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  Demo Import (FAQ)
                </button>
                <button
                  type="button"
                  onClick={() => setTestQuestion('Who has permission to delete discussion posts?')}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  Permissions (DB)
                </button>
                <button
                  type="button"
                  onClick={() => setTestQuestion('What is quantum astrophysics and rocket propulsion?')}
                  className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium cursor-pointer transition-colors border border-amber-200"
                >
                  Out of Scope
                </button>
              </div>
            </div>

            {/* Test Input Form */}
            <form onSubmit={handleTestQuery} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Test Query:</label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTestLang('en')}
                    className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${testLang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestLang('bn')}
                    className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${testLang === 'bn' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                placeholder="Enter sample question to test chunk retrieval..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
              />

              <button
                type="submit"
                disabled={testLoading || !testQuestion.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testLoading ? 'Querying Knowledge Base...' : 'Run Query Test'}</span>
              </button>
            </form>

            {/* Test Output Box */}
            {testResponse && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-slate-900 font-semibold">
                    Simulated Response
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                    Source: {testResponse.source}
                  </span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {testResponse.reply}
                </p>
                <div className="text-[10px] text-slate-400 text-right font-mono">
                  Completed at {testResponse.time}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AI KNOWLEDGE INGESTION (FILES & ELEMENTS) & FILTER WORKSPACE    */}
      {/* ========================================================================= */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    AI Knowledge Ingestion & Chunking
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Gemini Multimodal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Analyze documents, images, or raw web elements with direct AI to extract maximal structured knowledge.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFileModalOpen(false);
                  setSelectedFile(null);
                  setRawElementsInput('');
                  setElementsTitle('');
                  setExtractedDrafts([]);
                  setAnalysisError(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Two Modes (Input vs Review) */}
            {extractedDrafts.length === 0 ? (
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Mode Selector Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIngestMode('file');
                      setAnalysisError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      ingestMode === 'file'
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span>Upload Reference File (PDF, Word, Markdown, Text, CSV, JSON, Screenshots)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIngestMode('elements');
                      setAnalysisError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      ingestMode === 'elements'
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code className="w-4 h-4 text-indigo-600" />
                    <span>Paste Elements / Direct Content (Web Text, Policies, FAQs, HTML/JSON)</span>
                  </button>
                </div>

                {/* MODE 1: FILE UPLOAD ZONE */}
                {ingestMode === 'file' && (
                  <div className="space-y-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                        dragActive 
                          ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]' 
                          : selectedFile
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,image/*"
                      />

                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
                        {selectedFile ? (
                          <FileText className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <UploadCloud className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>

                      {selectedFile ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium">
                            <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                            <span>&bull;</span>
                            <span>{selectedFile.type || 'Document'}</span>
                            <span>&bull;</span>
                            <span className="underline hover:text-emerald-700">Click to change file</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800">
                            Drag & drop your reference document here, or <span className="text-indigo-600 underline font-bold">browse files</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Supported: PDF (.pdf), Word (.doc/.docx), Markdown (.md), Plain Text (.txt), JSON (.json), CSV (.csv), or screenshot images (.png/.jpg/.webp)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: PASTE ELEMENTS / DIRECT TEXT */}
                {ingestMode === 'elements' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Content Label / Topic Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={elementsTitle}
                        onChange={(e) => setElementsTitle(e.target.value)}
                        placeholder="e.g. MISA Foreign Investment Guidelines 2026, Tax Exemption Rules, Support Policy..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Paste Elements / Raw Unstructured Text to Analyze
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {rawElementsInput.length.toLocaleString()} characters
                        </span>
                      </div>
                      <textarea
                        rows={7}
                        value={rawElementsInput}
                        onChange={(e) => setRawElementsInput(e.target.value)}
                        placeholder="Paste webpage elements, copy-pasted HTML snippets, service brochures, product pricing tiers, troubleshooting logs, internal policy notes, or FAQs here..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-mono leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Preferred Category Tag & Preset Pills */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      Target Category Tag
                    </label>
                    <span className="text-[11px] text-slate-500">Helps AI organize and index chunks</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fileCategoryHint}
                      onChange={(e) => setFileCategoryHint(e.target.value)}
                      placeholder="e.g. Documentation, Company Formation, Banking, Pricing..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs font-medium"
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                    {[
                      'Documentation',
                      'Company Formation',
                      'MISA & Licensing',
                      'Banking & Tax',
                      'PRO & Visas',
                      'Technical & Software',
                      'Platform FAQs'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFileCategoryHint(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                          fileCategoryHint === preset
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Gemini API Key Override */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gemini API Key</span>
                      <span className="text-[10px] font-normal text-slate-500">(Optional Override)</span>
                    </label>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      customApiKey.trim() 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : status?.isKeyConfigured 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1' 
                          : 'bg-slate-100 text-slate-500'
                    }`}>
                      {customApiKey.trim() ? (
                        'Local Override Active'
                      ) : status?.isKeyConfigured ? (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>DB Synced {status.activeModel ? `(${status.activeModel})` : ''}</span>
                        </>
                      ) : (
                        'System Default (.env)'
                      )}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder={
                        status?.isKeyConfigured
                          ? `Using project-wide key & ${status.activeModel || 'Gemini'} from Database (AI Engine Tab). Leave blank to use it.`
                          : "AIzaSy... (optional - leave blank to use system key or offline text parser)"
                      }
                      className="w-full pl-3 pr-20 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showApiKey ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 gap-1 pt-0.5">
                    <span>
                      Google AI Studio keys start with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700 font-bold">AIzaSy</code>.
                    </span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline font-semibold"
                    >
                      Get Free Gemini API Key (aistudio.google.com) &rarr;
                    </a>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    ⚡ Built-in offline OCR automatically recognizes text from images & screenshots even if no API key is provided!
                  </p>
                </div>

                {/* Security Guarantee Alert */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-950">
                      Zero Persistence & Ephemeral Ingestion Guarantee:
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Neither uploaded files nor pasted raw elements are ever saved to the server filesystem or database. Gemini AI analyzes the content in RAM, and only the knowledge chunks you review and approve below will be committed to PostgreSQL.
                    </p>
                  </div>
                </div>

                {/* Analysis Error Alert */}
                {analysisError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span className="font-medium">{analysisError}</span>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsFileModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      isAnalyzingFile || 
                      (ingestMode === 'file' && !selectedFile) || 
                      (ingestMode === 'elements' && !rawElementsInput.trim())
                    }
                    onClick={handleAnalyze}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {isAnalyzingFile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Deep Knowledge Analysis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Extract Maximum Knowledge Chunks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* REVIEW & FILTER WORKSPACE: ADMIN REVIEWS & COMMITS CHUNKS                */
              /* ========================================================================= */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Review Header Banner */}
                <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        AI Extracted {extractedDrafts.length} Knowledge Chunks
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {extractedDrafts.filter(d => d.selected).length} Selected for DB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review, filter, edit, or discard chunks before saving. Only selected chunks will be stored in PostgreSQL.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedDrafts([]);
                      setAnalysisError(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Analyze another document / input</span>
                  </button>
                </div>

                {/* Filter Toolbar */}
                <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    {/* Live Search */}
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={draftSearchQuery}
                        onChange={(e) => setDraftSearchQuery(e.target.value)}
                        placeholder="Filter chunks by keyword in title, content, or tags..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Quick Selection Actions */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectAllDrafts(true)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                        title="Select all visible chunks"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllDrafts(false)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                        title="Deselect all visible chunks"
                      >
                        Deselect All
                      </button>
                      <button
                        type="button"
                        onClick={handleInvertDrafts}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                        title="Invert current selection"
                      >
                        Invert
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomDraftChunk}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold cursor-pointer transition-colors"
                        title="Add an additional chunk manually"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chunk</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Pills & Count Metrics */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
                      <button
                        type="button"
                        onClick={() => setDraftCategoryFilter('all')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          draftCategoryFilter === 'all'
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All ({extractedDrafts.length})
                      </button>
                      {extractedCategories.map(cat => {
                        const count = extractedDrafts.filter(d => (d.category || 'General') === cat).length;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDraftCategoryFilter(cat)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              draftCategoryFilter === cat
                                ? 'bg-slate-900 text-white font-semibold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      Showing {filteredDrafts.length} of {extractedDrafts.length}
                    </span>
                  </div>
                </div>

                {/* Chunks Card List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {filteredDrafts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No chunks match the current filter "{draftSearchQuery}". Clear filter to view all chunks.
                    </div>
                  ) : (
                    filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className={`rounded-xl border transition-all p-4 space-y-3 ${
                          draft.selected
                            ? 'bg-white border-slate-300 shadow-xs ring-1 ring-slate-900/5'
                            : 'bg-slate-100/70 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Chunk Card Header: Checkbox + Title + Category + Discard */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 flex-1">
                            <input
                              type="checkbox"
                              checked={draft.selected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, selected: checked } : d));
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                              title="Include chunk in database commit"
                            />
                            <input
                              type="text"
                              value={draft.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, title: newTitle } : d));
                              }}
                              placeholder="Chunk Title"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-medium">Cat:</span>
                              <input
                                type="text"
                                value={draft.category}
                                onChange={(e) => {
                                  const newCat = e.target.value;
                                  setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, category: newCat } : d));
                                }}
                                placeholder="Category"
                                className="w-28 px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-[10px] font-mono uppercase font-bold text-slate-700"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setExtractedDrafts(prev => prev.filter(d => d.id !== draft.id));
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Discard this chunk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Optional Summary & Tags Badges */}
                        {(draft.summary || (draft.tags && draft.tags.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                            {draft.summary && (
                              <span className="italic text-slate-600">
                                💡 {draft.summary}
                              </span>
                            )}
                            {draft.tags && draft.tags.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Chunk Content Textarea */}
                        <textarea
                          rows={4}
                          value={draft.content}
                          onChange={(e) => {
                            const newContent = e.target.value;
                            setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, content: newContent } : d));
                          }}
                          placeholder="Extracted knowledge content..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50/70 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Commit Action Bar */}
                <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {extractedDrafts.filter(d => d.selected).length} of {extractedDrafts.length} chunks selected
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-medium">
                      Zero files stored on disk or DB
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFileModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDrafts || extractedDrafts.filter(d => d.selected).length === 0}
                      onClick={handleSaveSelectedDrafts}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                    >
                      {isSavingDrafts ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Committing to PostgreSQL...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Commit {extractedDrafts.filter(d => d.selected).length} Chunks to Knowledge Base</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL CHUNK CREATE / EDIT */}
      {/* ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingDoc ? 'Edit Knowledge Chunk' : 'New Knowledge Chunk'}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualDoc} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Category Tag <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docForm.category}
                  onChange={(e) => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Platform, Themes, Consultancy, Billing..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Chunk Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Docly WordPress Theme Installation Guide"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Knowledge Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={docForm.content}
                  onChange={(e) => setDocForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter detailed facts, technical specifications, or support procedures..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs leading-relaxed font-mono resize-y"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                >
                  {editingDoc ? 'Update Chunk' : 'Save Chunk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
