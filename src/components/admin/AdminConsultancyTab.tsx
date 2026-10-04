import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  ArrowUpRight,
  MessageSquare,
  Edit2,
  Trash2
} from 'lucide-react';
import { ConsultancyInquiry } from '../../types';

interface AdminConsultancyTabProps {
  inquiries: ConsultancyInquiry[];
  onUpdateStatus: (id: string, status: ConsultancyInquiry['status']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteInquiry: (id: string) => void;
}

export const AdminConsultancyTab: React.FC<AdminConsultancyTabProps> = ({
  inquiries,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteInquiry
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<ConsultancyInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = inq.company.toLowerCase().includes(search.toLowerCase()) ||
                          inq.email.toLowerCase().includes(search.toLowerCase()) ||
                          inq.scope.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenLead = (lead: ConsultancyInquiry) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      onUpdateNotes(selectedLead.id, editingNotes);
      setSelectedLead({ ...selectedLead, notes: editingNotes });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Consultancy Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming enterprise requests, architecture consultations, and technical inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            {inquiries.filter(i => i.status === 'new').length} New Unassigned
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'new', 'reviewing', 'contacted', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer capitalize border ${
                filterStatus === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {st === 'all' ? 'All Inquiries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {inq.company}
                    </h3>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wider ${
                      inq.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : inq.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {inq.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{inq.email}</span>
                    <span>•</span>
                    <span className="font-mono">{inq.date}</span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={inq.status}
                  onChange={(e) => onUpdateStatus(inq.id, e.target.value as ConsultancyInquiry['status'])}
                  aria-label={`Update status for ${inq.company}`}
                  className="text-xs font-medium px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer shrink-0"
                >
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Project Scope */}
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-normal">
                <span className="font-semibold text-slate-900 block mb-0.5">Scope / Requirements:</span>
                {inq.scope}
              </div>

              {/* Assigned Architect & Notes */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned: <strong className="text-slate-800 font-medium">{inq.assignedTo || 'Unassigned'}</strong></span>
                </div>
                {inq.notes && (
                  <span className="italic text-slate-500 truncate max-w-xs">
                    "{inq.notes}"
                  </span>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenLead(inq)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-slate-500" />
                Notes & Scope
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${inq.email}?subject=Trek%20Consultancy%20Response%20-%20${encodeURIComponent(inq.company)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <Mail className="w-3 h-3" />
                  Email Client
                </a>

                <button
                  onClick={() => onDeleteInquiry(inq.id)}
                  aria-label="Archive or remove lead"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInquiries.length === 0 && (
        <div className="py-12 text-center text-slate-500 rounded-xl bg-white border border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No consultancy inquiries in this category</p>
        </div>
      )}

      {/* Scope / Notes Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl p-5 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedLead.company}
                </h3>
                <p className="text-xs text-slate-500">{selectedLead.email}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Project Specifications:
                </label>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedLead.scope}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Internal Architectural Notes:
                </label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record discussion outcomes, requirements, or next steps..."
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveNotes();
                  setSelectedLead(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-2xs cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
