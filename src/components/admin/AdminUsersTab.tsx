import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminUsersTabProps {
  users: AdminUser[];
  onUpdateRole: (id: string, role: AdminUser['role']) => void;
  onToggleStatus: (id: string) => void;
  onAddUser: (user: AdminUser) => void;
  onDeleteUser?: (id: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onUpdateRole,
  onToggleStatus,
  onAddUser,
  onDeleteUser
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Moderator');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      joinedDate: 'Just now',
      threadsCount: 0
    };

    onAddUser(newUser);
    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Community Staff & Moderators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Assign leadership roles, regulate forum permissions, and manage staff access.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/80 border border-slate-200/80 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Staff Member</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4 text-center">Joined</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-teal-500/5 transition-colors">
                  {/* Avatar & Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full ring-1 ring-slate-200 object-cover shrink-0"
                      />
                      <div>
                        <p className="font-heading font-bold text-sm text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector */}
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as AdminUser['role'])}
                      aria-label={`Role for ${user.name}`}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                    >
                      <option value="User">👤 User</option>
                      <option value="Super Admin">🛡️ Super Admin</option>
                      <option value="Support Specialist">🎧 Support Specialist</option>
                      <option value="Moderator">⚖️ Moderator</option>
                      <option value="Community Lead">🌟 Community Lead</option>
                    </select>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-center">
                    <span className="text-slate-500 font-medium text-xs">
                      {user.joinedDate || 'Recent'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Toggle Status & Delete Button */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>

                      {onDeleteUser && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${user.name}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-6 sm:p-7 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-heading font-bold text-slate-900">
                Grant Staff Permissions
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Foster"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="liam.foster@amatheme.io"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  <option value="User">Normal User (Community Member)</option>
                  <option value="Moderator">Moderator (Thread pruning, tagging)</option>
                  <option value="Support Specialist">Support Specialist (Ticketing)</option>
                  <option value="Community Lead">Community Lead (Events, Blogs)</option>
                  <option value="Super Admin">Super Admin (Full Root Permissions)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  Confirm Staff Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
