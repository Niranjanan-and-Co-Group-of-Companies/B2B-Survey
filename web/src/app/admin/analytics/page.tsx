"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BarChart3, PieChart as PieChartIcon, TrendingUp, MapPin,
    Download, RefreshCw, ChevronLeft, Filter, Calendar,
    Building2, Users, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";

const COLORS = ["#0D9488", "#1E3A5F", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#22C55E", "#6366F1", "#14B8A6"];

interface AnalyticsData {
    totalSurveys: number;
    verifiedCount: number;
    pendingCount: number;
    rejectedCount: number;
    thisWeek: number;
    lastWeek: number;
    growthRate: number;
    avgPerDay: number;
}

interface IndustryData {
    name: string;
    count: number;
    percentage: number;
}

interface LocationData {
    state: string;
    count: number;
}

interface TimelineData {
    date: string;
    count: number;
}

interface QuestionAnalysis {
    questionKey: string;
    questionText: string;
    questionType: string;
    responses: number;
    data: { label: string; value: number }[];
    stats?: { avg?: number; min?: number; max?: number };
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState("30d");

    // Filter states
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [industries, setIndustries] = useState<{ id: string; display_name: string; industry_key: string }[]>([]);

    // Indian states for filter
    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu and Kashmir",
        "Ladakh", "Lakshadweep", "Puducherry"
    ];

    // Analytics data
    const [overview, setOverview] = useState<AnalyticsData>({
        totalSurveys: 0, verifiedCount: 0, pendingCount: 0, rejectedCount: 0,
        thisWeek: 0, lastWeek: 0, growthRate: 0, avgPerDay: 0
    });
    const [industryData, setIndustryData] = useState<IndustryData[]>([]);
    const [locationData, setLocationData] = useState<LocationData[]>([]);
    const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
    const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);

    // Fetch industries list for filter dropdown
    useEffect(() => {
        const fetchIndustries = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            try {
                const res = await fetch(`${API_URL}/api/industries`);
                const data = await res.json();
                if (data.success) {
                    setIndustries(data.data || []);
                }
            } catch (e) {
                console.error("Failed to fetch industries:", e);
            }
        };
        fetchIndustries();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchAllData();
    }, [router, dateRange, selectedIndustry, selectedState]);

    const fetchAllData = async () => {
        setRefreshing(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        // Build filter query params
        const filterParams = new URLSearchParams();
        if (dateRange) filterParams.append("range", dateRange);
        if (selectedIndustry) filterParams.append("industry", selectedIndustry);
        if (selectedState) filterParams.append("state", selectedState);
        const filterQuery = filterParams.toString();

        try {
            const [overviewRes, industryRes, locationRes, timelineRes, questionsRes] = await Promise.allSettled([
                fetch(`${API_URL}/api/analytics/overview?${filterQuery}`, { headers }),
                fetch(`${API_URL}/api/analytics/by-industry?${filterQuery}`, { headers }),
                fetch(`${API_URL}/api/analytics/by-location?${filterQuery}`, { headers }),
                fetch(`${API_URL}/api/analytics/timeline?${filterQuery}`, { headers }),
                fetch(`${API_URL}/api/analytics/per-question?${filterQuery}`, { headers })
            ]);

            if (overviewRes.status === "fulfilled") {
                const data = await overviewRes.value.json();
                if (data.success) {
                    const totals = data.data.totals || {};
                    const byStatus = data.data.byStatus || {};
                    setOverview({
                        totalSurveys: totals.all || 0,
                        verifiedCount: byStatus.verified || 0,
                        pendingCount: byStatus.submitted || 0,
                        rejectedCount: byStatus.rejected || 0,
                        thisWeek: totals.thisWeek || 0,
                        lastWeek: totals.lastWeek || 0,
                        growthRate: totals.thisWeek && totals.lastWeek ?
                            Math.round(((totals.thisWeek - totals.lastWeek) / totals.lastWeek) * 100) : 0,
                        avgPerDay: totals.all ? Math.round(totals.all / 30) : 0
                    });
                }
            }

            if (industryRes.status === "fulfilled") {
                const data = await industryRes.value.json();
                if (data.success && data.data) {
                    const total = data.data.reduce((sum: number, item: IndustryData) => sum + item.count, 0);
                    setIndustryData(data.data.map((item: IndustryData) => ({
                        ...item,
                        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
                    })));
                }
            }

            if (locationRes.status === "fulfilled") {
                const data = await locationRes.value.json();
                if (data.success) setLocationData(data.data || []);
            }

            if (timelineRes.status === "fulfilled") {
                const data = await timelineRes.value.json();
                if (data.success) setTimelineData(data.data || []);
            }

            if (questionsRes.status === "fulfilled") {
                const data = await questionsRes.value.json();
                if (data.success) setQuestionAnalysis(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleExport = async () => {
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        try {
            const response = await fetch(`${API_URL}/api/surveys/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data) {
                const csv = convertToCSV(data.data);
                downloadCSV(csv, `survey-analytics-${new Date().toISOString().split('T')[0]}.csv`);
            }
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    const convertToCSV = (data: Record<string, unknown>[]) => {
        if (!data.length) return "";
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => JSON.stringify(row[h] || "")).join(","));
        return [headers.join(","), ...rows].join("\n");
    };

    const downloadCSV = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    };

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/dashboard" className="text-[var(--text-muted)] hover:text-[var(--primary)]">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
                            Analytics
                        </h1>
                    </div>
                    <p className="text-[var(--text-secondary)]">
                        Deep insights into your survey responses
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Filter */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="input px-4 py-2"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                    <button
                        onClick={fetchAllData}
                        disabled={refreshing}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Filters:</span>
                    </div>

                    {/* Industry Filter */}
                    <select
                        value={selectedIndustry}
                        onChange={(e) => {
                            setSelectedIndustry(e.target.value);
                            setSelectedSubCategory("");
                        }}
                        className="input px-3 py-2 text-sm min-w-[180px]"
                    >
                        <option value="">All Industries</option>
                        {industries.map((ind) => (
                            <option key={ind.id} value={ind.industry_key}>
                                {ind.display_name}
                            </option>
                        ))}
                    </select>

                    {/* State Filter */}
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="input px-3 py-2 text-sm min-w-[180px]"
                    >
                        <option value="">All States</option>
                        {indianStates.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    {(selectedIndustry || selectedState) && (
                        <button
                            onClick={() => {
                                setSelectedIndustry("");
                                setSelectedSubCategory("");
                                setSelectedState("");
                            }}
                            className="text-sm text-[var(--accent)] hover:underline"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Active Filters Display */}
                {(selectedIndustry || selectedState) && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                        {selectedIndustry && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm">
                                <Building2 className="w-3 h-3" />
                                {industries.find(i => i.industry_key === selectedIndustry)?.display_name}
                                <button onClick={() => setSelectedIndustry("")} className="ml-1 hover:text-[var(--accent-dark)]">×</button>
                            </span>
                        )}
                        {selectedState && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm">
                                <MapPin className="w-3 h-3" />
                                {selectedState}
                                <button onClick={() => setSelectedState("")} className="ml-1 hover:text-[var(--primary-dark)]">×</button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        {overview.growthRate !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${overview.growthRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {overview.growthRate > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(overview.growthRate)}%
                            </div>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{overview.totalSurveys}</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Responses</p>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-green-500">{overview.verifiedCount}</p>
                    <p className="text-sm text-[var(--text-muted)]">Verified</p>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-500">{overview.pendingCount}</p>
                    <p className="text-sm text-[var(--text-muted)]">Pending Review</p>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{overview.avgPerDay}</p>
                    <p className="text-sm text-[var(--text-muted)]">Avg per Day</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Submissions Timeline */}
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Submissions Over Time</h2>
                        <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div className="h-[300px]">
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#0D9488"
                                        strokeWidth={2}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Industry Distribution */}
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">By Industry</h2>
                        <PieChartIcon className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div className="h-[300px]">
                        {industryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={industryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="count"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} (${Math.round((percent || 0) * 100)}%)`}
                                        labelLine={false}
                                    >
                                        {industryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                                No data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">By Location</h2>
                    <MapPin className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <div className="h-[300px]">
                    {locationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={locationData.slice(0, 10)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis type="category" dataKey="state" width={120} stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px"
                                    }}
                                />
                                <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                            No location data available
                        </div>
                    )}
                </div>
            </div>

            {/* Per-Question Analysis */}
            <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Response Analysis by Question</h2>
                    <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                </div>

                {questionAnalysis.length > 0 ? (
                    <div className="space-y-8">
                        {questionAnalysis.map((question, index) => (
                            <div key={question.questionKey} className="border-b border-[var(--border)] pb-6 last:border-0">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">
                                            {index + 1}. {question.questionText}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {question.responses} responses • {question.questionType}
                                        </p>
                                    </div>
                                    {question.stats && (
                                        <div className="text-right text-sm text-[var(--text-secondary)]">
                                            {question.stats.avg !== undefined && (
                                                <p>Avg: <span className="font-semibold">{question.stats.avg}</span></p>
                                            )}
                                            {question.stats.min !== undefined && question.stats.max !== undefined && (
                                                <p>Range: {question.stats.min} - {question.stats.max}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {question.data.length > 0 && (
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={question.data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--surface)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "8px"
                                                    }}
                                                />
                                                <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No question-level analysis available yet</p>
                        <p className="text-sm mt-1">Submit some surveys to see detailed breakdowns</p>
                    </div>
                )}
            </div>
        </div>
    );
}
