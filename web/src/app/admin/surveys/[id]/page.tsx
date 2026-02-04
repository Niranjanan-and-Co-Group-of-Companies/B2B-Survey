"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Building2,
    User,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    Edit,
    Trash2,
    ExternalLink,
    Image,
    Camera,
} from "lucide-react";

interface SurveyDetail {
    id: string;
    survey_id: string;
    business_name: string;
    owner_name: string;
    contact_phone: string;
    contact_email: string;
    contact_whatsapp: string;
    street: string;
    landmark: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    location: any;
    location_source: string;
    years_in_operation: number;
    employees_count: number;
    current_method: string;
    monthly_budget_min: number;
    monthly_budget_max: number;
    purchasing_frequency: string;
    primary_payment_method: string;
    preferred_credit_period: number;
    pain_points: string[];
    willing_to_switch: string;
    industry_data: any;
    status: string;
    source: string;
    notes: string;
    created_at: string;
    updated_at: string;
    industries?: { display_name: string; icon: string };
    sub_category: string;
}

export default function SurveyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const token = localStorage.getItem("token");
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                const response = await fetch(`${API_URL}/api/surveys/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.success) {
                    setSurvey(data.data);
                }
            } catch (error) {
                console.error("Error fetching survey:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
        fetchPhotos();
    }, [params.id]);

    const fetchPhotos = async () => {
        setPhotosLoading(true);
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/surveys/${params.id}/photos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success && data.data) {
                setPhotos(data.data);
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        } finally {
            setPhotosLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem("token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/surveys/${params.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                setSurvey((prev) => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading survey...</p>
                </div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Survey not found</h2>
                <Link href="/admin/surveys" className="text-[var(--accent)] hover:underline">
                    ← Back to surveys
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "verified": return "bg-green-500";
            case "rejected": return "bg-red-500";
            default: return "bg-yellow-500";
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/surveys"
                        className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{survey.industries?.icon || "🏢"}</span>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                    {survey.business_name}
                                </h1>
                                <p className="text-[var(--text-secondary)]">
                                    {survey.survey_id} • {survey.industries?.display_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(survey.status)}`}>
                        {survey.status}
                    </span>
                    {survey.status === "submitted" && (
                        <>
                            <button
                                onClick={() => updateStatus("verified")}
                                disabled={updating}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Verify
                            </button>
                            <button
                                onClick={() => updateStatus("rejected")}
                                disabled={updating}
                                className="btn btn-outline text-red-500 border-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Details */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[var(--accent)]" />
                            Business Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Industry</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.industries?.display_name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Sub Category</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.sub_category || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Years in Operation</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.years_in_operation ? `${survey.years_in_operation} years` : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Employees</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.employees_count || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--accent)]" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Owner Name</p>
                                <p className="font-medium text-[var(--text-primary)]">{survey.owner_name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Phone</p>
                                <p className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                                    {survey.contact_phone || "N/A"}
                                    {survey.contact_phone && (
                                        <a href={`tel:${survey.contact_phone}`} className="text-[var(--accent)]">
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Email</p>
                                <p className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                                    {survey.contact_email || "N/A"}
                                    {survey.contact_email && (
                                        <a href={`mailto:${survey.contact_email}`} className="text-[var(--accent)]">
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">WhatsApp</p>
                                <p className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                                    {survey.contact_whatsapp || "N/A"}
                                    {survey.contact_whatsapp && (
                                        <a
                                            href={`https://wa.me/${survey.contact_whatsapp}`}
                                            target="_blank"
                                            className="text-green-500"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Procurement Details */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[var(--accent)]" />
                            Procurement Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Monthly Budget</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.monthly_budget_min && survey.monthly_budget_max
                                        ? `${formatCurrency(survey.monthly_budget_min)} - ${formatCurrency(survey.monthly_budget_max)}`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Purchasing Frequency</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.purchasing_frequency || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Payment Method</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.primary_payment_method || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Credit Period</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.preferred_credit_period ? `${survey.preferred_credit_period} days` : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Current Method</p>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {survey.current_method || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Willing to Switch</p>
                                <p className={`font-medium ${survey.willing_to_switch === "yes"
                                    ? "text-green-600"
                                    : survey.willing_to_switch === "no"
                                        ? "text-red-600"
                                        : "text-yellow-600"
                                    }`}>
                                    {survey.willing_to_switch?.toUpperCase() || "N/A"}
                                </p>
                            </div>
                        </div>

                        {survey.pain_points && survey.pain_points.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-[var(--text-secondary)] mb-2">Pain Points</p>
                                <div className="flex flex-wrap gap-2">
                                    {survey.pain_points.map((point, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                                            {point}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Survey Photos */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-[var(--accent)]" />
                            Survey Photos
                            {photos.length > 0 && (
                                <span className="text-sm font-normal text-[var(--text-secondary)]">
                                    ({photos.length} photo{photos.length !== 1 ? "s" : ""})
                                </span>
                            )}
                        </h2>

                        {photosLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full"></div>
                            </div>
                        ) : photos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {photos.map((photo, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedPhoto(photo.url)}
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                    >
                                        <img
                                            src={photo.url}
                                            alt={`Survey photo ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[var(--text-muted)]">
                                <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>No photos uploaded for this survey</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Location */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[var(--accent)]" />
                            Location
                        </h2>
                        <div className="space-y-2 text-sm">
                            {survey.street && <p>{survey.street}</p>}
                            {survey.landmark && <p className="text-[var(--text-secondary)]">Near {survey.landmark}</p>}
                            <p className="font-medium">
                                {survey.city}, {survey.district}
                            </p>
                            <p>{survey.state} - {survey.pincode}</p>
                        </div>

                        {survey.location && (
                            <a
                                href={`https://www.google.com/maps?q=${survey.location.coordinates?.[1]},${survey.location.coordinates?.[0]}`}
                                target="_blank"
                                className="btn btn-outline w-full mt-4 flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in Maps
                            </a>
                        )}

                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            Source: {survey.location_source || "Not provided"}
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[var(--accent)]" />
                            Details
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Survey ID</span>
                                <span className="font-mono text-[var(--accent)]">{survey.survey_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Source</span>
                                <span>{survey.source === "website" ? "🌐 Website" : "📱 Mobile App"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Submitted</span>
                                <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Updated</span>
                                <span>{new Date(survey.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Notes</h2>
                        <textarea
                            placeholder="Add notes about this survey..."
                            className="input w-full h-24 resize-none"
                            defaultValue={survey.notes || ""}
                        />
                        <button className="btn btn-outline w-full mt-2">Save Notes</button>
                    </div>
                </div>
            </div>

            {/* Photo Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedPhoto}
                            alt="Survey photo full size"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
