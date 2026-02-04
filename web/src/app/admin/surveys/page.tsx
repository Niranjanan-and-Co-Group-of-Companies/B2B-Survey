"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    Download,
    Eye,
    Phone,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Building2,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

interface Survey {
    id: string;
    survey_id: string;
    business_name: string;
    owner_name: string;
    contact_phone: string;
    city: string;
    state: string;
    status: string;
    source: string;
    created_at: string;
    industries?: { display_name: string; icon: string };
}

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchSurveys();
    }, [currentPage, statusFilter, sourceFilter]);

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "20",
            });
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (sourceFilter !== "all") params.append("source", sourceFilter);

            const response = await fetch(`http://localhost:5001/api/surveys?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setSurveys(data.data || []);
                setTotalPages(data.pagination?.pages || 1);
                setTotal(data.pagination?.total || 0);
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSurveys = surveys.filter(
        (s) =>
            s.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.survey_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const styles = {
            submitted: "bg-yellow-100 text-yellow-700",
            verified: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
        };
        const icons = {
            submitted: Clock,
            verified: CheckCircle,
            rejected: XCircle,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.submitted}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    const getSourceBadge = (source: string) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${source === "website" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                }`}>
                {source === "website" ? "🌐 Web" : "📱 App"}
            </span>
        );
    };

    const exportToCSV = () => {
        const headers = ["Survey ID", "Business", "Owner", "Phone", "City", "State", "Status", "Source", "Date"];
        const rows = filteredSurveys.map((s) => [
            s.survey_id,
            s.business_name,
            s.owner_name || "",
            s.contact_phone || "",
            s.city || "",
            s.state || "",
            s.status,
            s.source,
            new Date(s.created_at).toLocaleDateString(),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `surveys-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Surveys</h1>
                    <p className="text-[var(--text-secondary)]">{total} total surveys collected</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="btn btn-outline flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search by business, city, or survey ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input w-full lg:w-40"
                    >
                        <option value="all">All Status</option>
                        <option value="submitted">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Source Filter */}
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="input w-full lg:w-40"
                    >
                        <option value="all">All Sources</option>
                        <option value="website">Website</option>
                        <option value="mobile_app">Mobile App</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[var(--text-secondary)]">Loading surveys...</p>
                    </div>
                ) : filteredSurveys.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2">No surveys found</h3>
                        <p className="text-[var(--text-secondary)]">
                            {searchQuery ? "Try a different search term" : "Start collecting surveys to see them here"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Survey</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Business</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Contact</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Location</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Source</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Date</th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredSurveys.map((survey) => (
                                    <tr key={survey.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="font-mono text-sm text-[var(--accent)]">{survey.survey_id}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[var(--surface-hover)] rounded-lg flex items-center justify-center text-xl">
                                                    {survey.industries?.icon || "🏢"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">{survey.business_name}</p>
                                                    <p className="text-sm text-[var(--text-secondary)]">
                                                        {survey.industries?.display_name || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-[var(--text-primary)]">{survey.owner_name || "—"}</p>
                                                {survey.contact_phone && (
                                                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {survey.contact_phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {survey.city ? (
                                                <p className="text-[var(--text-primary)] flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                                                    {survey.city}, {survey.state}
                                                </p>
                                            ) : (
                                                <span className="text-[var(--text-muted)]">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">{getStatusBadge(survey.status)}</td>
                                        <td className="px-4 py-4">{getSourceBadge(survey.source)}</td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(survey.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/admin/surveys/${survey.id}`}
                                                className="btn btn-outline btn-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="btn btn-outline btn-sm disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="btn btn-outline btn-sm disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
