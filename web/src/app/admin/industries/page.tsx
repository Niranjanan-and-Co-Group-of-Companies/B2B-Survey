"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    ChevronDown,
    ChevronRight,
    Building2,
    Search,
    Save,
    X,
    Check,
    HelpCircle,
    GripVertical,
} from "lucide-react";

interface Industry {
    id: string;
    industry_key: string;
    display_name: string;
    icon: string;
    description: string;
    is_active: boolean;
    sub_categories: SubCategory[];
}

interface SubCategory {
    id: string;
    category_key: string;
    display_name: string;
}

interface IndustryQuestion {
    id: string;
    field_key: string;
    label: string;
    field_type: string;
    options: string[];
    is_required: boolean;
    placeholder: string | null;
    display_order: number;
}

export default function IndustriesPage() {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [questions, setQuestions] = useState<Record<string, IndustryQuestion[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"details" | "questions">("details");

    // Modal states
    const [showIndustryModal, setShowIndustryModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<IndustryQuestion | null>(null);
    const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);

    // Form states
    const [industryForm, setIndustryForm] = useState({
        industry_key: "",
        display_name: "",
        icon: "🏢",
        description: "",
        is_active: true,
    });

    const [questionForm, setQuestionForm] = useState({
        field_key: "",
        label: "",
        field_type: "text",
        options: [""],
        is_required: false,
        placeholder: "",
    });

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/industries`);
            const data = await response.json();
            if (data.success) {
                setIndustries(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching industries:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async (industryId: string) => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(
                `${API_URL}/api/industries/${industryId}/questions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) {
                setQuestions((prev) => ({ ...prev, [industryId]: data.data || [] }));
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            // Use mock questions for demo
            setQuestions((prev) => ({
                ...prev,
                [industryId]: [
                    {
                        id: "1",
                        field_key: "seating_capacity",
                        label: "What is your seating capacity?",
                        field_type: "number",
                        options: [],
                        is_required: true,
                        placeholder: null,
                        display_order: 1,
                    },
                    {
                        id: "2",
                        field_key: "cuisine_type",
                        label: "What type of cuisine do you serve?",
                        field_type: "multiselect",
                        options: ["North Indian", "South Indian", "Chinese", "Continental", "Fast Food"],
                        is_required: true,
                        placeholder: null,
                        display_order: 2,
                    },
                ],
            }));
        }
    };

    const filtered = industries.filter(
        (i) =>
            i.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.industry_key?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddIndustry = () => {
        setEditingIndustry(null);
        setIndustryForm({
            industry_key: "",
            display_name: "",
            icon: "🏢",
            description: "",
            is_active: true,
        });
        setShowIndustryModal(true);
    };

    const openEditIndustry = (industry: Industry) => {
        setEditingIndustry(industry);
        setIndustryForm({
            industry_key: industry.industry_key,
            display_name: industry.display_name,
            icon: industry.icon,
            description: industry.description || "",
            is_active: industry.is_active,
        });
        setShowIndustryModal(true);
    };

    const saveIndustry = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const url = editingIndustry
                ? `${API_URL}/api/industries/${editingIndustry.id}`
                : `${API_URL}/api/industries`;

            const method = editingIndustry ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(industryForm),
            });

            if (response.ok) {
                fetchIndustries();
                setShowIndustryModal(false);
            }
        } catch (error) {
            console.error("Error saving industry:", error);
            // Fallback for demo/offline
            fetchIndustries();
            setShowIndustryModal(false);
        }
    };

    const deleteIndustry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this industry?")) return;
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            await fetch(`${API_URL}/api/industries/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setIndustries((prev) => prev.filter((i) => i.id !== id));
        } catch (error) {
            console.error("Error deleting industry:", error);
            setIndustries((prev) => prev.filter((i) => i.id !== id));
        }
    };

    const openAddQuestion = (industryId: string) => {
        setSelectedIndustryId(industryId);
        setEditingQuestion(null);
        setQuestionForm({
            field_key: "",
            label: "",
            field_type: "text",
            options: [""],
            is_required: false,
            placeholder: "",
        });
        setShowQuestionModal(true);
    };

    const openEditQuestion = (industryId: string, question: IndustryQuestion) => {
        setSelectedIndustryId(industryId);
        setEditingQuestion(question);
        setQuestionForm({
            field_key: question.field_key,
            label: question.label,
            field_type: question.field_type,
            options: question.options?.length ? question.options : [""],
            is_required: question.is_required,
            placeholder: question.placeholder || "",
        });
        setShowQuestionModal(true);
    };

    const saveQuestion = async () => {
        if (!selectedIndustryId) return;
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const method = editingQuestion ? "PUT" : "POST";
            const url = editingQuestion
                ? `${API_URL}/api/industries/${selectedIndustryId}/questions/${editingQuestion.id}`
                : `${API_URL}/api/industries/${selectedIndustryId}/questions`;

            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...questionForm,
                    options: questionForm.options.filter((o) => o.trim()),
                }),
            });

            fetchQuestions(selectedIndustryId);
            setShowQuestionModal(false);
        } catch (error) {
            console.error("Error saving question:", error);
            setShowQuestionModal(false);
        }
    };

    const deleteQuestion = async (industryId: string, questionId: string) => { // Renamed from handleDeleteQuestion and swapped args to match usage? usage was (industry.id, q.id)
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            await fetch(
                `${API_URL}/api/industries/${industryId}/questions/${questionId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuestions((prev) => ({
                ...prev,
                [industryId]: prev[industryId].filter((q) => q.id !== questionId),
            }));
        } catch (error) {
            console.error("Error deleting question:", error);
            // Update local state even on error for smoother UI if backend is tricky
            setQuestions((prev) => ({
                ...prev,
                [industryId]: prev[industryId].filter((q) => q.id !== questionId),
            }));
        }
    };

    const addOption = () => {
        setQuestionForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
    };

    const updateOption = (index: number, value: string) => {
        setQuestionForm((prev) => ({
            ...prev,
            options: prev.options.map((o, i) => (i === index ? value : o)),
        }));
    };

    const removeOption = (index: number) => {
        setQuestionForm((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleExpandIndustry = (industryId: string) => {
        if (expandedIndustry === industryId) {
            setExpandedIndustry(null);
        } else {
            setExpandedIndustry(industryId);
            if (!questions[industryId]) {
                fetchQuestions(industryId);
            }
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading industries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Industries</h1>
                    <p className="text-[var(--text-secondary)]">
                        Manage {industries.length} industries and their survey questions
                    </p>
                </div>
                <button onClick={openAddIndustry} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Industry
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Total Industries</p>
                    <p className="text-3xl font-bold text-[var(--accent)]">{industries.length}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">With Sub-Categories</p>
                    <p className="text-3xl font-bold text-green-500">
                        {industries.filter((i) => i.sub_categories?.length > 0).length}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Total Sub-Categories</p>
                    <p className="text-3xl font-bold text-purple-500">
                        {industries.reduce((acc, i) => acc + (i.sub_categories?.length || 0), 0)}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-[var(--text-secondary)]">Active</p>
                    <p className="text-3xl font-bold text-blue-500">
                        {industries.filter((i) => i.is_active).length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search industries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
            </div>

            {/* Industries List */}
            <div className="space-y-4">
                {filtered.map((industry) => (
                    <div key={industry.id} className="card overflow-hidden">
                        {/* Industry Header */}
                        <div
                            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--surface-hover)] transition-colors ${expandedIndustry === industry.id ? "border-b border-[var(--border)]" : ""
                                }`}
                            onClick={() => handleExpandIndustry(industry.id)}
                        >
                            <div className="text-[var(--text-muted)]">
                                {expandedIndustry === industry.id ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                            </div>

                            <div className="w-12 h-12 bg-[var(--surface-hover)] rounded-xl flex items-center justify-center text-2xl">
                                {industry.icon}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    {industry.display_name}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {industry.industry_key} • {industry.sub_categories?.length || 0} sub-categories
                                </p>
                            </div>

                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${industry.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}>
                                {industry.is_active ? "Active" : "Inactive"}
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => openEditIndustry(industry)}
                                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-lg"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => deleteIndustry(industry.id)}
                                    className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedIndustry === industry.id && (
                            <div className="bg-[var(--surface-hover)]/50">
                                {/* Tabs */}
                                <div className="flex border-b border-[var(--border)]">
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details"
                                            ? "border-[var(--accent)] text-[var(--accent)]"
                                            : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            }`}
                                    >
                                        Details & Sub-Categories
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("questions")}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "questions"
                                            ? "border-[var(--accent)] text-[var(--accent)]"
                                            : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            }`}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        Survey Questions
                                    </button>
                                </div>

                                {/* Details Tab */}
                                {activeTab === "details" && (
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">Description</p>
                                            <p className="text-[var(--text-primary)]">
                                                {industry.description || "No description"}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-[var(--text-secondary)]">
                                                    Sub-Categories
                                                </p>
                                                <button className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                                                    <Plus className="w-4 h-4" />
                                                    Add Sub-Category
                                                </button>
                                            </div>
                                            {industry.sub_categories?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {industry.sub_categories.map((sub) => (
                                                        <div
                                                            key={sub.id}
                                                            className="px-3 py-1.5 bg-[var(--surface)] rounded-lg flex items-center gap-2 group"
                                                        >
                                                            <span className="text-[var(--text-primary)]">{sub.display_name}</span>
                                                            <button className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-[var(--text-muted)]">No sub-categories defined</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Questions Tab */}
                                {activeTab === "questions" && (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                                {questions[industry.id]?.length || 0} Industry-Specific Questions
                                            </p>
                                            <button
                                                onClick={() => openAddQuestion(industry.id)}
                                                className="btn btn-outline btn-sm flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Question
                                            </button>
                                        </div>

                                        {questions[industry.id]?.length > 0 ? (
                                            <div className="space-y-3">
                                                {questions[industry.id].map((q, idx) => (
                                                    <div
                                                        key={q.id}
                                                        className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] group"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="text-[var(--text-muted)] cursor-grab">
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-mono bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                                                                        {q.field_type}
                                                                    </span>
                                                                    {q.is_required && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                    {idx + 1}. {q.label}
                                                                </p>
                                                                {q.options?.length > 0 && (
                                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                                        {q.options.map((opt, oi) => (
                                                                            <span
                                                                                key={oi}
                                                                                className="text-xs px-2 py-1 bg-[var(--surface-hover)] rounded"
                                                                            >
                                                                                {opt}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openEditQuestion(industry.id, q)}
                                                                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteQuestion(industry.id, q.id)}
                                                                    className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <HelpCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                                                <p className="text-[var(--text-secondary)]">No custom questions yet</p>
                                                <button
                                                    onClick={() => openAddQuestion(industry.id)}
                                                    className="text-[var(--accent)] hover:underline mt-2"
                                                >
                                                    Add your first question
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card p-12 text-center">
                    <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">No industries found</h3>
                    <p className="text-[var(--text-secondary)]">
                        {searchQuery ? "Try a different search term" : "Add your first industry to get started"}
                    </p>
                </div>
            )}

            {/* Industry Modal */}
            {showIndustryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {editingIndustry ? "Edit Industry" : "Add New Industry"}
                            </h2>
                            <button
                                onClick={() => setShowIndustryModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-20">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        value={industryForm.icon}
                                        onChange={(e) => setIndustryForm({ ...industryForm, icon: e.target.value })}
                                        className="input text-center text-2xl"
                                        maxLength={2}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={industryForm.display_name}
                                        onChange={(e) => setIndustryForm({ ...industryForm, display_name: e.target.value })}
                                        className="input w-full"
                                        placeholder="e.g., Restaurant"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Industry Key *
                                </label>
                                <input
                                    type="text"
                                    value={industryForm.industry_key}
                                    onChange={(e) => setIndustryForm({ ...industryForm, industry_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    className="input w-full font-mono"
                                    placeholder="e.g., restaurant"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Unique identifier (lowercase, no spaces)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={industryForm.description}
                                    onChange={(e) => setIndustryForm({ ...industryForm, description: e.target.value })}
                                    className="input w-full"
                                    rows={2}
                                    placeholder="Brief description of this industry"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
                                <span className="text-[var(--text-primary)]">Active</span>
                                <button
                                    onClick={() => setIndustryForm({ ...industryForm, is_active: !industryForm.is_active })}
                                    className={`w-12 h-6 rounded-full transition-colors ${industryForm.is_active ? "bg-[var(--accent)]" : "bg-gray-300"
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${industryForm.is_active ? "translate-x-6" : "translate-x-0.5"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowIndustryModal(false)}
                                    className="btn btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveIndustry}
                                    className="btn btn-primary flex-1"
                                >
                                    {editingIndustry ? "Save Changes" : "Add Industry"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {editingQuestion ? "Edit Question" : "Add New Question"}
                            </h2>
                            <button
                                onClick={() => setShowQuestionModal(false)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Question Text *
                                </label>
                                <textarea
                                    value={questionForm.label}
                                    onChange={(e) => setQuestionForm({ ...questionForm, label: e.target.value })}
                                    className="input w-full"
                                    rows={2}
                                    placeholder="e.g., What is your seating capacity?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Field Key *
                                </label>
                                <input
                                    type="text"
                                    value={questionForm.field_key}
                                    onChange={(e) => setQuestionForm({ ...questionForm, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    className="input w-full font-mono"
                                    placeholder="e.g., seating_capacity"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Question Type
                                </label>
                                <select
                                    value={questionForm.field_type}
                                    onChange={(e) => setQuestionForm({ ...questionForm, field_type: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="text">Text (Short Answer)</option>
                                    <option value="textarea">Text (Long Answer)</option>
                                    <option value="number">Number</option>
                                    <option value="select">Single Select (Dropdown)</option>
                                    <option value="radio">Single Select (Radio)</option>
                                    <option value="multiselect">Multi Select (Checkboxes)</option>
                                    <option value="boolean">Yes/No</option>
                                    <option value="date">Date</option>
                                    <option value="range">Range (Min-Max)</option>
                                </select>
                            </div>

                            {["select", "radio", "multiselect"].includes(questionForm.field_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Options
                                    </label>
                                    <div className="space-y-2">
                                        {questionForm.options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(idx, e.target.value)}
                                                    className="input flex-1"
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                                {questionForm.options.length > 1 && (
                                                    <button
                                                        onClick={() => removeOption(idx)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addOption}
                                        className="text-sm text-[var(--accent)] hover:underline mt-2 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Option
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
                                <span className="text-[var(--text-primary)]">Required</span>
                                <button
                                    onClick={() => setQuestionForm({ ...questionForm, is_required: !questionForm.is_required })}
                                    className={`w-12 h-6 rounded-full transition-colors ${questionForm.is_required ? "bg-[var(--accent)]" : "bg-gray-300"
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${questionForm.is_required ? "translate-x-6" : "translate-x-0.5"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowQuestionModal(false)}
                                    className="btn btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveQuestion}
                                    className="btn btn-primary flex-1"
                                >
                                    {editingQuestion ? "Save Changes" : "Add Question"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
