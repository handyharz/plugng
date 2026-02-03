'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Shield,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    Lock,
    Unlock,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    User,
    Clock
} from 'lucide-react';
import adminApi from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
    active: 'text-green-500 bg-green-500/10 border-green-500/20',
    suspended: 'text-red-500 bg-red-500/10 border-red-500/20',
};

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'admin'
    });

    const { data, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: adminApi.getAllAdmins
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setIsCreateModalOpen(false);
            setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'admin' });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create admin');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            adminApi.updateAdminStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const admins = data?.data || [];

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Admin Management
                    </h1>
                    <p className="text-slate-400">Manage dashboard users and their access levels</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New Admin
                </button>
            </div>

            {/* Admins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <p className="font-medium font-mono uppercase tracking-widest text-[10px]">Syncing secure nodes...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900 border border-white/10 rounded-3xl text-center">
                        <Shield className="w-16 h-16 text-slate-800 mb-4" />
                        <h3 className="text-white font-bold mb-2">No admin users found</h3>
                        <p className="text-slate-500 text-sm italic">This is strange. You shouldn't be here alone!</p>
                    </div>
                ) : admins.map((admin: any) => (
                    <div key={admin._id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 relative group hover:border-indigo-500/30 transition-all shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold uppercase text-lg">
                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${STATUS_COLORS[admin.status || 'active']}`}>
                                    {admin.status || 'active'}
                                </span>
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-slate-800 border border-white/10 text-slate-400">
                                    {admin.role?.replace('_', ' ') || 'admin'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-white font-bold text-lg">{admin.firstName} {admin.lastName}</h3>
                                <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-1">
                                    <Mail className="w-3 h-3" />
                                    {admin.email}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-medium">
                                    <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" /> Joined
                                    </span>
                                    <span className="text-slate-300">{new Date(admin.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-medium">
                                    <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Clock className="w-3 h-3" /> Last Login
                                    </span>
                                    <span className="text-slate-300">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button
                                onClick={() => toggleStatusMutation.mutate({
                                    id: admin._id,
                                    status: admin.status === 'suspended' ? 'active' : 'suspended'
                                })}
                                disabled={toggleStatusMutation.isPending}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${admin.status === 'suspended' ? 'bg-green-600/10 border-green-600/20 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white'}`}
                            >
                                {admin.status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                {admin.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Admin Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-500" />
                                Add New Admin User
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Access Level</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner appearance-none"
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="editor">Editor</option>
                                    <option value="support">Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">System Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                                />
                                <p className="mt-2 text-[9px] text-slate-600 font-medium px-1 italic">Passwords must be at least 8 characters with high entropy.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
