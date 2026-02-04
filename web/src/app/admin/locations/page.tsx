"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Search,
    Filter,
    List,
    Grid,
    ExternalLink,
    Phone,
    Building2,
} from "lucide-react";

interface SurveyLocation {
    id: string;
    survey_id: string;
    business_name: string;
    city: string;
    state: string;
    location: any;
    contact_phone: string;
    industries?: { display_name: string; icon: string };
}

export default function LocationsPage() {
    const [surveys, setSurveys] = useState<SurveyLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stateFilter, setStateFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/surveys?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setSurveys(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique states for filter
    const states = [...new Set(surveys.map((s) => s.state).filter(Boolean))].sort();

    // Filter surveys
    const filtered = surveys.filter((s) => {
        const matchesSearch =
            s.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesState = stateFilter === "all" || s.state === stateFilter;
        return matchesSearch && matchesState;
    });

    // Group by city
    const groupedByCity = filtered.reduce((acc, survey) => {
        const city = survey.city || "Unknown";
        if (!acc[city]) acc[city] = [];
        acc[city].push(survey);
        return acc;
    }, {} as Record<string, SurveyLocation[]>);

    // Sort cities by count
    const sortedCities = Object.entries(groupedByCity).sort((a, b) => b[1].length - a[1].length);

    // Stats by state
    const stateCounts = surveys.reduce((acc, s) => {
        if (s.state) {
            acc[s.state] = (acc[s.state] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading locations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Locations</h1>
                    <p className="text-[var(--text-secondary)]">
                        {surveys.length} surveys across {Object.keys(stateCounts).length} states
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* State Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(stateCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([state, count]) => (
                        <div
                            key={state}
                            onClick={() => setStateFilter(state === stateFilter ? "all" : state)}
                            className={`card p-4 cursor-pointer transition-all hover:scale-105 ${stateFilter === state ? "ring-2 ring-[var(--accent)]" : ""
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-[var(--accent)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {state}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--accent)]">{count}</p>
                            <p className="text-xs text-[var(--text-secondary)]">surveys</p>
                        </div>
                    ))}
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search by business or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="input w-full lg:w-56"
                    >
                        <option value="all">All States & UTs</option>
                        <optgroup label="Top States (by surveys)">
                            {states.slice(0, 5).map((state) => (
                                <option key={state} value={state}>
                                    {state} ({stateCounts[state] || 0})
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="States">
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                        </optgroup>
                        <optgroup label="Union Territories">
                            <option value="Andaman and Nicobar Islands">Andaman & Nicobar</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Dadra and Nagar Haveli and Daman and Diu">DNH & DD</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Jammu and Kashmir">Jammu & Kashmir</option>
                            <option value="Ladakh">Ladakh</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Puducherry">Puducherry</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="card p-6 mb-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        Interactive Map Coming Soon
                    </h3>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                        We're building an interactive map view where you can see all survey locations with GPS pins.
                        For now, you can view locations grouped by city below.
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Verified
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Pending
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Rejected
                        </span>
                    </div>
                </div>
            </div>

            {/* Cities Grid/List */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCities.map(([city, citySurveys]) => (
                        <div key={city} className="card overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <h3 className="font-semibold">{city}</h3>
                                    </div>
                                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                                        {citySurveys.length}
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm mt-1">
                                    {citySurveys[0]?.state}
                                </p>
                            </div>
                            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                                {citySurveys.slice(0, 5).map((survey) => (
                                    <div
                                        key={survey.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                                    >
                                        <span className="text-xl">{survey.industries?.icon || "🏢"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--text-primary)] truncate text-sm">
                                                {survey.business_name}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {survey.industries?.display_name}
                                            </p>
                                        </div>
                                        {survey.location && (
                                            <a
                                                href={`https://www.google.com/maps?q=${survey.location.coordinates?.[1]},${survey.location.coordinates?.[0]}`}
                                                target="_blank"
                                                className="p-1 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {citySurveys.length > 5 && (
                                    <p className="text-center text-sm text-[var(--text-secondary)]">
                                        +{citySurveys.length - 5} more
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Business</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">City</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">State</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Phone</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">Map</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filtered.slice(0, 50).map((survey) => (
                                <tr key={survey.id} className="hover:bg-[var(--surface-hover)]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{survey.industries?.icon || "🏢"}</span>
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {survey.business_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{survey.city || "—"}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{survey.state || "—"}</td>
                                    <td className="px-4 py-3">
                                        {survey.contact_phone ? (
                                            <a href={`tel:${survey.contact_phone}`} className="text-[var(--accent)] flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {survey.contact_phone}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {survey.location && (
                                            <a
                                                href={`https://www.google.com/maps?q=${survey.location.coordinates?.[1]},${survey.location.coordinates?.[0]}`}
                                                target="_blank"
                                                className="text-[var(--accent)] hover:underline"
                                            >
                                                Open
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="card p-12 text-center">
                    <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">No locations found</h3>
                    <p className="text-[var(--text-secondary)]">
                        {searchQuery ? "Try a different search term" : "No survey data available"}
                    </p>
                </div>
            )}
        </div>
    );
}
