"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BarChart3, ClipboardList, TrendingUp, Users, MapPin,
    Building2, Calendar, Download, RefreshCw, Eye, ChevronRight
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#0D9488", "#1E3A5F", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#22C55E"];

interface Overview {
    totals: { all: number; today: number; thisWeek: number; thisMonth: number };
    byStatus: { submitted: number; verified: number; rejected: number };
    bySource: { website: number; mobile_app: number };
}

interface IndustryData {
    name: string;
    count: number;
}

interface TimelineData {
    date: string;
    count: number;
}

interface Survey {
    id: string;
    survey_id: string;
    business_name: string;
    city: string;
    status: string;
    created_at: string;
    industries?: { display_name: string; icon: string };
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Real data states
    const [overview, setOverview] = useState<Overview>({
        totals: { all: 0, today: 0, thisWeek: 0, thisMonth: 0 },
        byStatus: { submitted: 0, verified: 0, rejected: 0 },
        bySource: { website: 0, mobile_app: 0 }
    });
    const [industryData, setIndustryData] = useState<IndustryData[]>([]);
    const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
    const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchAllData();
    }, [router]);

    const fetchAllData = async () => {
        setRefreshing(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        // Helper to fetch with timeout
        const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 8000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        };

        try {
            // Fetch all data in parallel with timeout
            const results = await Promise.allSettled([
                fetchWithTimeout(`${API_URL}/api/analytics/overview`, { headers }),
                fetchWithTimeout(`${API_URL}/api/analytics/by-industry`, { headers }),
                fetchWithTimeout(`${API_URL}/api/analytics/timeline`, { headers }),
                fetchWithTimeout(`${API_URL}/api/surveys?limit=5`, { headers })
            ]);

            // Process each result independently
            if (results[0].status === "fulfilled") {
                try {
                    const data = await results[0].value.json();
                    if (data.success) setOverview(data.data);
                } catch (e) { console.error("Overview parse error:", e); }
            }

            if (results[1].status === "fulfilled") {
                try {
                    const data = await results[1].value.json();
                    if (data.success) setIndustryData(data.data || []);
                } catch (e) { console.error("Industry parse error:", e); }
            }

            if (results[2].status === "fulfilled") {
                try {
                    const data = await results[2].value.json();
                    if (data.success) setTimelineData(data.data || []);
                } catch (e) { console.error("Timeline parse error:", e); }
            }

            if (results[3].status === "fulfilled") {
                try {
                    const data = await results[3].value.json();
                    if (data.success) setRecentSurveys(data.data || []);
                } catch (e) { console.error("Surveys parse error:", e); }
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleExport = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5001/api/surveys?limit=1000", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                const headers = ["ID", "Business Name", "City", "State", "Status", "Created At"];
                const rows = data.data.map((s: Survey) => [
                    s.survey_id,
                    s.business_name,
                    s.city,
                    s.status,
                    new Date(s.created_at).toLocaleDateString()
                ]);
                const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `surveys_export_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            }
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">Survey analytics and insights</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="btn btn-outline">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={fetchAllData} className="btn btn-primary" disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {[
                    { label: "Total Surveys", value: overview.totals.all, icon: ClipboardList, color: "var(--primary)" },
                    { label: "Today", value: overview.totals.today, icon: Calendar, color: "var(--accent)" },
                    { label: "This Week", value: overview.totals.thisWeek, icon: TrendingUp, color: "#3B82F6" },
                    { label: "Verified", value: overview.byStatus.verified, icon: Users, color: "#22C55E" },
                ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: `${stat.color}20` }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="text-[var(--text-muted)] text-sm">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Industry Distribution */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Industry Distribution</h2>
                    {industryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={industryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="count"
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {industryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                            <p>No survey data yet</p>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Survey Submissions (Last 30 Days)</h2>
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-muted)"
                                    tick={{ fontSize: 10 }}
                                    interval={Math.floor(timelineData.length / 6)}
                                />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--accent)"
                                    strokeWidth={3}
                                    dot={{ fill: "var(--accent)", r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                            <p>No timeline data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Source Distribution & Recent Surveys */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Source */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">By Source</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                            { name: "Website", value: overview.bySource.website },
                            { name: "Mobile App", value: overview.bySource.mobile_app },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip />
                            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Status breakdown */}
                    <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Submitted</span>
                            <span className="font-medium text-yellow-600">{overview.byStatus.submitted}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Verified</span>
                            <span className="font-medium text-green-600">{overview.byStatus.verified}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Rejected</span>
                            <span className="font-medium text-red-600">{overview.byStatus.rejected}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Surveys */}
                <div className="card p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Surveys</h2>
                        <Link href="/admin/surveys" className="text-[var(--accent)] text-sm flex items-center gap-1 hover:underline">
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentSurveys.length > 0 ? (
                            recentSurveys.map((survey, index) => (
                                <Link
                                    key={survey.id || survey.survey_id || index}
                                    href={`/admin/surveys/${survey.id}`}
                                    className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl hover:bg-[var(--border)] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                                            <span className="text-lg">{survey.industries?.icon || "🏢"}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">{survey.business_name}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{survey.city} • {formatDate(survey.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${survey.status === "verified"
                                                ? "bg-green-100 text-green-700"
                                                : survey.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {survey.status}
                                        </span>
                                        <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-[var(--text-muted)]">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No surveys submitted yet</p>
                                <p className="text-sm">Share the survey link to start collecting data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
