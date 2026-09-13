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
  Sparkles,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Consultancy & Architecture Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Incoming high-touch enterprise theme deployments, single-sign-on (SSO) setups, and SLA contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            {inquiries.filter(i => i.status === 'new').length} New Unassigned
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/80 border border-slate-200/80 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'new', 'reviewing', 'contacted', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
                filterStatus === st
                  ? 'bg-teal-500/15 text-teal-700 font-semibold border border-teal-500/30'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {st === 'all' ? 'All Inquiries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className="rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-teal-600 transition-colors">
                      {inq.company}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      inq.priority === 'urgent'
                        ? 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                        : inq.priority === 'high'
                        ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                        : 'bg-teal-500/10 text-teal-700 border border-teal-500/20'
                    }`}>
                      {inq.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>{inq.email}</span>
                    <span>•</span>
                    <span>{inq.date}</span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={inq.status}
                  onChange={(e) => onUpdateStatus(inq.id, e.target.value as ConsultancyInquiry['status'])}
                  aria-label={`Update status for ${inq.company}`}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                >
                  <option value="new">🟡 New</option>
                  <option value="reviewing">🔵 Reviewing</option>
                  <option value="contacted">🟣 Contacted</option>
                  <option value="resolved">🟢 Resolved</option>
                </select>
              </div>

              {/* Project Scope */}
              <div className="mt-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Architecture Scope:</span>
                {inq.scope}
              </div>

              {/* Assigned Architect & Notes */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assigned: <strong className="text-slate-800">{inq.assignedTo || 'Unassigned'}</strong></span>
                </div>
                {inq.notes && (
                  <span className="italic text-slate-400 truncate max-w-xs">
                    "{inq.notes}"
                  </span>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenLead(inq)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Notes & Scope Details
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${inq.email}?subject=Ama%20Consultancy%20Response%20-%20${encodeURIComponent(inq.company)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-md"
                >
                  <Mail className="w-3 h-3" />
                  Email Client
                </a>

                <button
                  onClick={() => onDeleteInquiry(inq.id)}
                  aria-label="Archive or remove lead"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInquiries.length === 0 && (
        <div className="py-12 text-center text-slate-500 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No consultancy inquiries in this category</p>
        </div>
      )}

      {/* Scope / Notes Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-6 sm:p-7 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900">
                  {selectedLead.company}
                </h3>
                <p className="text-xs text-slate-500">{selectedLead.email}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Project Specifications:
                </label>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedLead.scope}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Internal Architectural Notes:
                </label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record discussion outcomes, NDA statuses, or technical blockers..."
                  className="w-full p-3 rounded-2xl bg-white border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSaveNotes();
                  setSelectedLead(null);
                }}
                className="px-5 py-2 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/20 cursor-pointer"
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
