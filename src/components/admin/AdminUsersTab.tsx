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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Staff & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign leadership roles, regulate forum moderation permissions, and manage staff access.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Staff</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Joined</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Avatar & Name */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg ring-1 ring-slate-200 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector */}
                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as AdminUser['role'])}
                      aria-label={`Role for ${user.name}`}
                      className="text-xs font-medium px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer"
                    >
                      <option value="User">User</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Support Specialist">Support Specialist</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Community Lead">Community Lead</option>
                    </select>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-slate-500 text-[11px] font-mono">
                      {user.joinedDate || 'Recent'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wider ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Toggle Status & Delete Button */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
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
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-xl p-5 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Grant Staff Permissions
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Foster"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="liam.foster@trekconsultancy.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Staff Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none bg-white"
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
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs cursor-pointer"
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
