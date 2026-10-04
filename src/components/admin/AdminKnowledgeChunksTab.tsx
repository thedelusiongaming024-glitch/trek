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
                    setExtractedDrafts([]);
                    setAnalysisError(null);
                    setIsFileModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs cursor-pointer transition-colors whitespace-nowrap"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ingest File</span>
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
      {/* MODAL 1: FILE INGESTION & CHUNK EXTRACTION */}
      {/* ========================================================================= */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ingest Reference Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Extract structured knowledge chunks from uploaded files into PostgreSQL
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFileModalOpen(false);
                  setSelectedFile(null);
                  setExtractedDrafts([]);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If no drafts extracted yet, show the File Upload Zone */}
            {extractedDrafts.length === 0 ? (
              <div className="p-6 space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    dragActive 
                      ? 'border-slate-900 bg-slate-100/70' 
                      : selectedFile
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,image/*"
                  />

                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
                    {selectedFile ? <FileText className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5" />}
                  </div>

                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for extraction
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        Drop document here, or <span className="text-slate-900 underline font-semibold">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF, Markdown (.md), TXT, JSON, CSV, Word (.doc/.docx), or screenshot images
                      </p>
                    </div>
                  )}
                </div>

                {/* Category hint */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Category Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={fileCategoryHint}
                    onChange={(e) => setFileCategoryHint(e.target.value)}
                    placeholder="e.g. Documentation, Platform, Billing, Support..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                  />
                </div>

                {analysisError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFileModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || isAnalyzingFile}
                    onClick={handleAnalyzeFile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    {isAnalyzingFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting Chunks...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5" />
                        <span>Extract Knowledge Chunks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* If drafts are extracted, show Review step */
              <div className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">Extracted {extractedDrafts.length} Chunks</span>
                    <p className="text-[11px] text-slate-500">
                      Review chunks before saving. Deselect or edit any chunk.
                    </p>
                  </div>
                  <button
                    onClick={() => setExtractedDrafts([])}
                    className="text-[11px] font-medium text-slate-700 hover:underline cursor-pointer"
                  >
                    Upload another file
                  </button>
                </div>

                {/* List of Extracted Chunks to Edit / Deselect */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {extractedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
                        draft.selected 
                          ? 'bg-white border-slate-200 shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
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
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setExtractedDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, title: newTitle } : d));
                            }}
                            placeholder="Chunk Title"
                            className="flex-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-900"
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
                            className="w-24 px-2 py-1 rounded-md bg-white border border-slate-300 text-[10px] font-mono uppercase text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedDrafts(prev => prev.filter(d => d.id !== draft.id));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                            title="Discard chunk"
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
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                {/* Footer Save Action */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {extractedDrafts.filter(d => d.selected).length} of {extractedDrafts.length} selected for commit.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFileModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDrafts || extractedDrafts.filter(d => d.selected).length === 0}
                      onClick={handleSaveSelectedDrafts}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                    >
                      {isSavingDrafts ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to PostgreSQL...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Commit Selected Chunks</span>
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
