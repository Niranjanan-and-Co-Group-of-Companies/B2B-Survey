"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Mail,
    Shield,
    User,
    UserCheck,
    Eye,
    Clock,
    Check,
    X,
    AlertCircle,
} from "lucide-react";

interface UserData {
    id: string;
    email: string;
    name: string;
    role: "admin" | "collector" | "viewer";
    is_active: boolean;
    last_active: string | null;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ name: "", email: "", role: "collector", password: "" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const styles = {
            admin: "bg-red-100 text-red-700",
            collector: "bg-blue-100 text-blue-700",
            viewer: "bg-gray-100 text-gray-700",
        };
        const icons = {
            admin: Shield,
            collector: UserCheck,
            viewer: Eye,
        };
        const Icon = icons[role as keyof typeof icons] || User;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
                <Icon className="w-3 h-3" />
                {role}
            </span>
        );
    };

    const openAddModal = () => {
        setEditingUser(null);
        setForm({ name: "", email: "", role: "collector", password: "" });
        setError("");
        setShowModal(true);
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, role: user.role, password: "" });
        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const url = editingUser
                ? `${API_URL}/api/users/${editingUser.id}`
                : `${API_URL}/api/users`;

            const method = editingUser ? "PUT" : "POST";

            const body: Record<string, unknown> = {
                name: form.name,
                email: form.email,
                role: form.role,
            };

            // Only include password if provided
            if (form.password) {
                body.password = form.password;
            }

            // For new users, password is required
            if (!editingUser && !form.password) {
                setError("Password is required for new users");
                setSaving(false);
                return;
            }

            const response = await fetch(url, {
                method: editingUser ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(editingUser ? "User updated successfully!" : "User created successfully!");
                setShowModal(false);
                fetchUsers();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.error || "Failed to save user");
            }
        } catch (error) {
            console.error("Error saving user:", error);
            setError("Failed to save user. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setSuccess("User deleted successfully!");
                setDeleteConfirm(null);
                fetchUsers();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user");
        }
    };

    const toggleUserStatus = async (user: UserData) => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...user, is_active: !user.is_active }),
            });

            const data = await response.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && !showModal && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
                    <p className="text-[var(--text-secondary)]">
                        Manage {users.length} team members
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Total Users</p>
                    <p className="text-3xl font-bold text-[var(--accent)]">{users.length}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Admins</p>
                    <p className="text-3xl font-bold text-red-500">
                        {users.filter((u) => u.role === "admin").length}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Collectors</p>
                    <p className="text-3xl font-bold text-blue-500">
                        {users.filter((u) => u.role === "collector").length}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Active</p>
                    <p className="text-3xl font-bold text-green-500">
                        {users.filter((u) => u.is_active).length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">User</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Role</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Last Login</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Joined</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {filtered.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white font-semibold">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => toggleUserStatus(user)}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${user.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {user.is_active ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-3 h-3" />
                                                Inactive
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {user.last_active
                                            ? new Date(user.last_active).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-lg"
                                            title="Edit user"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(user.id)}
                                            className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Delete user"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <User className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2">No users found</h3>
                        <p className="text-[var(--text-secondary)]">
                            {searchQuery ? "Try a different search term" : "Add your first team member"}
                        </p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {editingUser ? "Edit User" : "Add New User"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input w-full"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input w-full"
                                    placeholder="john@example.com"
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Role *
                                </label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="collector">Collector - Can submit surveys</option>
                                    <option value="viewer">Viewer - Read-only access</option>
                                    <option value="admin">Admin - Full access</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input w-full"
                                    placeholder={editingUser ? "••••••••" : "Enter password"}
                                    required={!editingUser}
                                    minLength={6}
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Minimum 6 characters
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-outline flex-1"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : editingUser ? "Save Changes" : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete User?</h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            This action cannot be undone. The user will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn btn-outline flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="btn flex-1 bg-red-500 text-white hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
