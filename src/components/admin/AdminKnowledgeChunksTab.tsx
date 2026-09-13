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
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Zap,
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
  Filter
} from 'lucide-react';
import { KnowledgeDocument, AIKnowledgeStatus } from '../../types';

interface AdminKnowledgeChunksTabProps {
  onNotify: (message: string) => void;
}

interface ExtractedChunkDraft {
  id: string;
  title: string;
  category: string;
  content: string;
  selected: boolean;
}

export const AdminKnowledgeChunksTab: React.FC<AdminKnowledgeChunksTabProps> = ({ onNotify }) => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [status, setStatus] = useState<AIKnowledgeStatus | null>(null);
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

  // AI File Upload & Extraction Modal state
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategoryHint, setFileCategoryHint] = useState('Documentation');
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedDrafts, setExtractedDrafts] = useState<ExtractedChunkDraft[]>([]);
  const [isSavingDrafts, setIsSavingDrafts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Live Tester State
  const [testQuestion, setTestQuestion] = useState('');
  const [testLang, setTestLang] = useState<'en' | 'bn'>('en');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    reply: string;
    source: string;
    time: string;
  } | null>(null);

  // Fetch documents and AI status
  const fetchKnowledgeData = async () => {
    setLoading(true);
    try {
      const [docsRes, statusRes] = await Promise.all([
        fetch('/api/admin/support/knowledge-docs'),
        fetch('/api/admin/support/ai-knowledge-status')
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocs(docsData);
      }
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
    } catch (err) {
      console.error('Failed to load knowledge chunks data:', err);
    } finally {
      setLoading(false);
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
      acceptFileIfWithinLimit(e.dataTransfer.files[0]);
    }
  };

  const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

  const acceptFileIfWithinLimit = (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      setSelectedFile(null);
      setAnalysisError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB. The maximum allowed upload size is 2 MB.`);
      return;
    }
    setSelectedFile(file);
    setAnalysisError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      acceptFileIfWithinLimit(e.target.files[0]);
    }
  };

  // Analyze File with AI and Extract Chunks
  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;

    setIsAnalyzingFile(true);
    setAnalysisError(null);
    setExtractedDrafts([]);

    try {
      // Convert file to base64 or text
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

      const res = await fetch('/api/admin/support/knowledge-docs/extract-from-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          categoryHint: fileCategoryHint,
          autoSave: false // Let the admin inspect, edit, or remove unnecessary chunks first!
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze file');
      }

      const data = await res.json();
      if (data.chunks && Array.isArray(data.chunks)) {
        const drafts: ExtractedChunkDraft[] = data.chunks.map((c: any, idx: number) => ({
          id: `draft-${Date.now()}-${idx}`,
          title: c.title || `Chunk ${idx + 1}`,
          category: c.category || fileCategoryHint || 'General',
          content: c.content || '',
          selected: true
        }));
        setExtractedDrafts(drafts);
      } else {
        throw new Error('No knowledge chunks could be extracted from this document.');
      }
    } catch (err: any) {
      console.error('File analysis error:', err);
      setAnalysisError(err.message || 'Error occurred while analyzing file with AI.');
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // Commit selected extracted chunks to Database
  const handleSaveSelectedDrafts = async () => {
    const activeDrafts = extractedDrafts.filter(d => d.selected && d.title.trim() && d.content.trim());
    if (activeDrafts.length === 0) {
      onNotify('Please select at least one chunk to save into the knowledge base.');
      return;
    }

    setIsSavingDrafts(true);
    try {
      const savedDocsList: KnowledgeDocument[] = [];
      for (const draft of activeDrafts) {
        const res = await fetch('/api/admin/support/knowledge-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title.trim(),
            category: draft.category.trim() || fileCategoryHint,
            content: draft.content.trim(),
            status: 'published'
          })
        });

        if (res.ok) {
          const saved = await res.json();
          savedDocsList.push(saved);
        }
      }

      setDocs(prev => [...savedDocsList, ...prev]);
      onNotify(`Added ${savedDocsList.length} knowledge chunks from "${selectedFile?.name}" into PostgreSQL!`);

      // Refresh status
      const statusRes = await fetch('/api/admin/support/ai-knowledge-status');
      if (statusRes.ok) setStatus(await statusRes.json());

      // Reset modal
      setIsFileModalOpen(false);
      setSelectedFile(null);
      setExtractedDrafts([]);
    } catch (err) {
      console.error('Failed to save extracted chunks:', err);
    } finally {
      setIsSavingDrafts(false);
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
          language: testLang
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
      {/* 1. Real-Time Dynamic Database Sync Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Live PostgreSQL RAG & Multi-Modal File Knowledge Engine
              </span>
            </div>
            <h3 className="text-lg font-bold font-heading text-white">
              AI Knowledge Chunks & Document Ingestion System
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload any document (PDF, TXT, Markdown, CSV, JSON, Word, or images with text) to let AI automatically extract structured knowledge chunks. Any chunk added or deleted is synchronized in real time with the PostgreSQL database.
            </p>
          </div>

          {/* Quick Metrics from DB */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 self-stretch lg:self-auto shrink-0">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block text-lg font-bold text-teal-400">{status?.totalChunks ?? docs.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Knowledge Chunks</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block text-lg font-bold text-purple-400">{status?.totalFaqs ?? 7}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Live FAQs</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block text-lg font-bold text-blue-400">{status?.totalTopics ?? 15}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Topics Indexed</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="block text-xs font-mono font-bold text-emerald-400 truncate max-w-[120px] mx-auto">
                {status?.activeAiModel || 'gemini-2.5-flash'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Active AI Model</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Knowledge Documents Management & Live Tester Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Knowledge Document Chunks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chunk knowledge by title, content, or category..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons: AI File Ingestion & Manual Add */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchKnowledgeData}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                  title="Refresh knowledge chunks"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* AI File Ingestion Button */}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setExtractedDrafts([]);
                    setAnalysisError(null);
                    setIsFileModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>AI Ingest File</span>
                </button>

                {/* Manual Add Chunk Button */}
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Chunk</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills & Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({docs.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-xs'
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
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline underline-offset-2"
                  >
                    {selectedDocIds.length === filteredDocs.length ? 'Deselect All' : 'Select All'}
                  </button>

                  {selectedDocIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Selected ({selectedDocIds.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chunks List */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white/60 rounded-3xl border border-white/80 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-semibold">No knowledge chunks found matching your search.</p>
                <p className="text-[11px] text-slate-400">Click &quot;AI Ingest File&quot; to upload any document and have Gemini extract structured chunks automatically!</p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`rounded-3xl p-5 backdrop-blur-xl border transition-all space-y-2.5 ${
                      isSelected 
                        ? 'bg-rose-50/70 border-rose-200 shadow-sm' 
                        : 'bg-white/85 hover:bg-white border-white/90 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectDoc(doc.id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                          title="Select to delete"
                        />
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-tight">
                          {doc.category || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
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
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
                          title="Edit Chunk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Unnecessary Chunk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                      <div className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {doc.content}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Real-Time RAG Synchronized
                      </span>
                      <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: AI Live Sandbox & Prompt Tester */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="rounded-3xl p-5 bg-white/85 backdrop-blur-xl border border-white/90 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  AI Knowledge Sandbox & Live Tester
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Real-Time RAG
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Test queries to verify how the AI responds based on your newly uploaded file chunks, FAQs, or brand promotion directives:
            </p>

            {/* Quick Test Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTestQuestion('How do I import demo content in Docly theme?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  Demo Import (FAQ)
                </button>
                <button
                  type="button"
                  onClick={() => setTestQuestion('Who has permission to delete discussion posts?')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  Delete Permission (DB)
                </button>
                <button
                  type="button"
                  onClick={() => setTestQuestion('What is quantum astrophysics and rocket propulsion?')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium cursor-pointer transition-colors border border-amber-200"
                >
                  Out of Scope (Brand & Escalation)
                </button>
              </div>
            </div>

            {/* Test Input Form */}
            <form onSubmit={handleTestQuery} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Test Inquiry:</label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTestLang('en')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${testLang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestLang('bn')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${testLang === 'bn' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                placeholder="Type a question to verify that AI retrieves your latest file chunks..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={testLoading || !testQuestion.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testLoading ? 'Querying AI & Database...' : 'Run Real-Time AI Test'}</span>
              </button>
            </form>

            {/* Test Output Box */}
            {testResponse && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-indigo-700 uppercase">
                    <Sparkles className="w-3 h-3" /> Live Assistant Reply
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-200/70 text-indigo-900">
                    Source: {testResponse.source}
                  </span>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {testResponse.reply}
                </p>
                <div className="text-[10px] text-slate-400 text-right">
                  Tested at {testResponse.time}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AI FILE INGESTION & CHUNK EXTRACTION */}
      {/* ========================================================================= */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Document & Knowledge Ingestion
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload any file to extract and save structured knowledge chunks directly into the database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFileModalOpen(false);
                  setSelectedFile(null);
                  setExtractedDrafts([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If no drafts extracted yet, show the File Upload Zone */}
            {extractedDrafts.length === 0 ? (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                      : selectedFile
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-200 hover:border-indigo-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,image/*"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                    {selectedFile ? <FileText className="w-6 h-6 text-emerald-600" /> : <UploadCloud className="w-6 h-6" />}
                  </div>

                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for AI analysis
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Drag and drop your file here, or <span className="text-indigo-600 underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports PDF, Markdown (.md), TXT, JSON, CSV, Word (.doc/.docx), and Screenshots/Images — max 2 MB per file
                      </p>
                    </div>
                  )}
                </div>

                {/* Category hint */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Category Tag (Optional):
                  </label>
                  <input
                    type="text"
                    value={fileCategoryHint}
                    onChange={(e) => setFileCategoryHint(e.target.value)}
                    placeholder="e.g. Documentation, Themes, Policies, Billing, Troubleshooting..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800"
                  />
                </div>

                {analysisError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFileModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || isAnalyzingFile}
                    onClick={handleAnalyzeFile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    {isAnalyzingFile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing & Extracting Chunks with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze & Extract Knowledge Chunks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* If drafts are extracted, show the Review & Unnecessary Chunk Deletion Step */
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900">Extracted {extractedDrafts.length} Knowledge Chunks</span>
                    <p className="text-[11px] text-indigo-700">
                      Review the chunks below. Uncheck or remove any unnecessary chunks before saving to the database.
                    </p>
                  </div>
                  <button
                    onClick={() => setExtractedDrafts([])}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Upload another file
                  </button>
                </div>

                {/* List of Extracted Chunks to Edit / Deselect */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {extractedDrafts.map((draft, idx) => (
                    <div
                      key={draft.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        draft.selected 
                          ? 'bg-slate-50 border-slate-200' 
                          : 'bg-slate-100/60 border-slate-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={draft.selected}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, selected: isChecked } : d));
                            }}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, title: newTitle } : d));
                            }}
                            placeholder="Chunk Title"
                            className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={draft.category}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, category: newCat } : d));
                            }}
                            placeholder="Category"
                            className="w-28 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold uppercase text-teal-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedDrafts(prev => prev.filter(d => d.id !== draft.id));
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Discard this chunk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={draft.content}
                        onChange={(e) => {
                          const newContent = e.target.value;
                          setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, content: newContent } : d));
                        }}
                        placeholder="Extracted knowledge content..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                {/* Footer Save Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {extractedDrafts.filter(d => d.selected).length} of {extractedDrafts.length} chunks selected for database insertion.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFileModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDrafts || extractedDrafts.filter(d => d.selected).length === 0}
                      onClick={handleSaveSelectedDrafts}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {isSavingDrafts ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to PostgreSQL...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Selected Chunks to Database</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDoc ? 'Edit Knowledge Chunk' : 'Add New RAG Knowledge Chunk'}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveManualDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category:</label>
                <input
                  type="text"
                  required
                  value={docForm.category}
                  onChange={(e) => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Themes, Community, Consultancy, Security..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Chunk Title:</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Docly WordPress Theme Installation Guide"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Knowledge Chunk Content:</label>
                <textarea
                  rows={4}
                  required
                  value={docForm.content}
                  onChange={(e) => setDocForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter detailed factual instructions, architecture summaries, or support rules that the AI will use to formulate responses..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingDoc ? 'Update Knowledge Chunk' : 'Save & Sync to AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
