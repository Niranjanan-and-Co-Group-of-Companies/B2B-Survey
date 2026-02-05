"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, CheckCircle, Loader2, Camera, X, Image as ImageIcon, RefreshCw, AlertCircle } from "lucide-react";

// Mock industries removed - now fetching from API
interface SubCategory {
    id: string;
    category_key: string;
    display_name: string;
}

interface Industry {
    id: string;
    industry_key: string;
    display_name: string;
    icon: string;
    description: string;
    sub_categories: SubCategory[];
}

const painPointOptions = [
    { key: "high_prices", label: "High Prices" },
    { key: "inconsistent_quality", label: "Inconsistent Quality" },
    { key: "delivery_delays", label: "Delivery Delays" },
    { key: "no_credit", label: "No Credit Available" },
    { key: "limited_variety", label: "Limited Product Variety" },
    { key: "poor_customer_service", label: "Poor Customer Service" },
    { key: "no_returns", label: "No Return Policy" },
    { key: "minimum_order_requirements", label: "High Minimum Order" },
];

export default function SurveyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    // Dynamic industry questions from database
    interface IndustryQuestion {
        id: string;
        field_key: string;
        label: string;
        field_type: string;
        options: string[] | null;
        placeholder: string | null;
        required: boolean;
    }
    const [industryQuestions, setIndustryQuestions] = useState<IndustryQuestion[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);

    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loadingIndustries, setLoadingIndustries] = useState(true);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                const res = await fetch(`${API_URL}/api/industries`);
                const data = await res.json();
                if (data.success) {
                    setIndustries(data.data);
                }
            } catch (error) {
                console.error("Error fetching industries:", error);
            } finally {
                setLoadingIndustries(false);
            }
        };
        fetchIndustries();
    }, []);

    const [formData, setFormData] = useState({
        // Step 1: Industry
        industry: "",
        industryId: "", // Added to track UUID
        subCategory: "",

        // Step 2: Business Info
        businessName: "",
        ownerName: "",
        contactPhone: "",
        contactEmail: "",
        yearsInOperation: "",
        employeeCount: "",

        // Step 3: Location
        street: "",
        city: "",
        state: "",
        pincode: "",
        coordinates: null as [number, number] | null,
        locationSource: "not_provided",

        // Step 4: Procurement
        procurementMethod: "",
        monthlyBudgetMin: "",
        monthlyBudgetMax: "",
        currentCreditPeriod: "",
        preferredCreditPeriod: "",
        painPoints: [] as string[],
        willingToSwitch: "",

        // Step 5: Industry specific (dynamic)
        industryData: {} as Record<string, string | number | boolean>,

        // Photos with upload status tracking
        photos: [] as { file: File; preview: string; status: 'pending' | 'uploading' | 'success' | 'error'; error?: string }[],
    });

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const updateField = (field: string, value: string | number | boolean | string[] | [number, number] | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateIndustryData = (field: string, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            industryData: { ...prev.industryData, [field]: value },
        }));
    };

    const togglePainPoint = (key: string) => {
        const current = formData.painPoints;
        if (current.includes(key)) {
            updateField("painPoints", current.filter((p) => p !== key));
        } else {
            updateField("painPoints", [...current, key]);
        }
    };

    // Fetch industry questions when industry changes
    useEffect(() => {
        const fetchIndustryQuestions = async () => {
            if (!formData.industry) {
                setIndustryQuestions([]);
                return;
            }

            setQuestionsLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

            try {
                const res = await fetch(`${API_URL}/api/industries/${formData.industry}/questions`);
                const data = await res.json();
                if (data.success && data.data) {
                    setIndustryQuestions(data.data.industry_questions || []);
                } else {
                    setIndustryQuestions([]);
                }
            } catch (e) {
                console.error("Failed to fetch industry questions:", e);
                setIndustryQuestions([]);
            } finally {
                setQuestionsLoading(false);
            }
        };

        fetchIndustryQuestions();
    }, [formData.industry]);

    const getLocation = () => {
        setLocationStatus("loading");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    updateField("coordinates", [position.coords.longitude, position.coords.latitude]);
                    updateField("locationSource", "gps_auto");
                    setLocationStatus("success");
                },
                () => {
                    setLocationStatus("error");
                }
            );
        } else {
            setLocationStatus("error");
        }
    };

    // Photo handling
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Support all common image formats
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/heic', 'image/heif'];

        const newPhotos = Array.from(files)
            .filter(file => validTypes.includes(file.type) || file.type.startsWith('image/'))
            .slice(0, 5 - formData.photos.length)
            .map(file => ({
                file,
                preview: URL.createObjectURL(file),
                status: 'pending' as const
            }));

        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos].slice(0, 5)
        }));
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    // Helper to update photo status by index
    const updatePhotoStatus = (index: number, status: 'pending' | 'uploading' | 'success' | 'error', error?: string) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.map((photo, i) =>
                i === index ? { ...photo, status, error } : photo
            )
        }));
    };

    // Retry failed photo upload
    const retryPhotoUpload = (index: number) => {
        updatePhotoStatus(index, 'pending', undefined);
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.industry && formData.subCategory;
            case 2:
                return formData.businessName && formData.contactPhone;
            case 3:
                return formData.city && formData.state;
            case 4:
                return formData.willingToSwitch;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const selectedIndustryObj = industries.find(i => i.industry_key === formData.industry);

            const surveyData = {
                business: {
                    name: formData.businessName,
                    industry: formData.industry,
                    industryId: selectedIndustryObj?.id, // Send UUID if available 
                    subCategory: formData.subCategory,
                    ownerName: formData.ownerName,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                    yearsInOperation: formData.yearsInOperation ? parseInt(formData.yearsInOperation) : undefined,
                    employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                    },
                    location: formData.coordinates ? {
                        type: "Point",
                        coordinates: formData.coordinates,
                    } : undefined,
                    locationSource: formData.locationSource,
                },
                currentProcurement: {
                    method: formData.procurementMethod,
                    monthlyBudget: {
                        min: formData.monthlyBudgetMin ? parseInt(formData.monthlyBudgetMin) : undefined,
                        max: formData.monthlyBudgetMax ? parseInt(formData.monthlyBudgetMax) : undefined,
                    },
                    currentCreditPeriod: formData.currentCreditPeriod ? parseInt(formData.currentCreditPeriod) : undefined,
                    preferredCreditPeriod: formData.preferredCreditPeriod ? parseInt(formData.preferredCreditPeriod) : undefined,
                    painPoints: formData.painPoints,
                    willingToSwitch: formData.willingToSwitch,
                },
                industryData: formData.industryData,
                meta: {
                    source: "website" as const,
                },
            };

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_URL}/api/surveys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(surveyData),
            });

            if (response.ok) {
                const data = await response.json();
                const surveyId = data.data.surveyId;

                // Upload photos if any - wait for all to complete before redirecting
                if (formData.photos.length > 0) {
                    const uploadPromises = formData.photos.map((photo, index) => {
                        return new Promise<void>((resolve) => {
                            // Set status to uploading
                            updatePhotoStatus(index, 'uploading');

                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                try {
                                    const uploadResponse = await fetch(`${API_URL}/api/upload/photo`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            photo: reader.result,
                                            surveyId,
                                            filename: photo.file.name
                                        }),
                                    });
                                    const uploadData = await uploadResponse.json();
                                    if (uploadData.success) {
                                        updatePhotoStatus(index, 'success');
                                        console.log("Photo uploaded:", uploadData.data?.id || uploadData.data?.filename);
                                    } else {
                                        updatePhotoStatus(index, 'error', uploadData.error || 'Upload failed');
                                        console.error("Photo upload failed:", uploadData.error);
                                    }
                                    resolve();
                                } catch (e) {
                                    updatePhotoStatus(index, 'error', 'Network error');
                                    console.error("Photo upload error:", e);
                                    resolve(); // Don't block on upload errors
                                }
                            };
                            reader.onerror = () => {
                                updatePhotoStatus(index, 'error', 'File read error');
                                console.error("File read error");
                                resolve(); // Don't block on read errors
                            };
                            reader.readAsDataURL(photo.file);
                        });
                    });

                    // Wait for all photo uploads to complete
                    await Promise.all(uploadPromises);
                    console.log("All photos processed");
                }

                router.push(`/thank-you?id=${surveyId}`);
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
            // For demo, redirect anyway
            router.push("/thank-you?id=DEMO-123");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedIndustry = industries.find((i) => i.industry_key === formData.industry);
    const availableSubCategories = selectedIndustry?.sub_categories || [];

    return (
        <main className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)]">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="text-sm text-[var(--text-muted)]">
                        Step {step} of {totalSteps}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar h-1">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Step 1: Select Industry */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Select Your Industry</h1>
                        <p className="text-[var(--text-secondary)] mb-8">Choose the industry that best describes your business</p>

                        {loadingIndustries ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {industries.filter(i => i.industry_key).map((industry) => (
                                    <div
                                        key={industry.industry_key}
                                        onClick={() => {
                                            updateField("industry", industry.industry_key);
                                            updateField("subCategory", "");
                                        }}
                                        className={`industry-card ${formData.industry === industry.industry_key ? "selected" : ""}`}
                                    >
                                        <div className="text-3xl mb-2">{industry.icon}</div>
                                        <div className="font-medium text-sm text-[var(--text-primary)]">{industry.display_name}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.industry && availableSubCategories.length > 0 && (
                            <div className="animate-fadeIn">
                                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Select Sub-Category</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableSubCategories.map((sub) => (
                                        <button
                                            key={sub.category_key}
                                            onClick={() => updateField("subCategory", sub.category_key)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.subCategory === sub.category_key
                                                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                                : "border-[var(--border)] hover:border-[var(--accent)]/50"
                                                }`}
                                        >
                                            {sub.display_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.industry && !loadingIndustries && availableSubCategories.length === 0 && (
                            <input
                                type="hidden"
                                value="general"
                                onChange={() => updateField("subCategory", "general")}
                            />
                        )}
                    </div>
                )}

                {/* Step 2: Business Information */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Business Information</h1>
                        <p className="text-[var(--text-secondary)] mb-8">Tell us about your {selectedIndustry?.display_name}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="label">Business Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter your business name"
                                    value={formData.businessName}
                                    onChange={(e) => updateField("businessName", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Owner/Manager Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Full name"
                                        value={formData.ownerName}
                                        onChange={(e) => updateField("ownerName", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="10-digit mobile"
                                        value={formData.contactPhone}
                                        onChange={(e) => updateField("contactPhone", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="email@example.com"
                                    value={formData.contactEmail}
                                    onChange={(e) => updateField("contactEmail", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Years in Operation</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g., 5"
                                        value={formData.yearsInOperation}
                                        onChange={(e) => updateField("yearsInOperation", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Employee Count</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g., 10"
                                        value={formData.employeeCount}
                                        onChange={(e) => updateField("employeeCount", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Business Location</h1>
                        <p className="text-[var(--text-secondary)] mb-8">Where is your business located?</p>

                        {/* GPS Button */}
                        <button
                            onClick={getLocation}
                            disabled={locationStatus === "loading"}
                            className={`w-full mb-6 p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${locationStatus === "success"
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-dashed border-[var(--accent)] hover:bg-[var(--accent)]/5"
                                }`}
                        >
                            {locationStatus === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : locationStatus === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <MapPin className="w-5 h-5" />
                            )}
                            {locationStatus === "success" ? "Location Captured!" : "Get Current Location (GPS)"}
                        </button>

                        <div className="space-y-6">
                            <div>
                                <label className="label">Street Address</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Street, building, landmark"
                                    value={formData.street}
                                    onChange={(e) => updateField("street", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">City *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={(e) => updateField("city", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">State *</label>
                                    <select
                                        className="input"
                                        value={formData.state}
                                        onChange={(e) => updateField("state", e.target.value)}
                                    >
                                        <option value="">Select State</option>
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
                                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                            <option value="Chandigarh">Chandigarh</option>
                                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                            <option value="Ladakh">Ladakh</option>
                                            <option value="Lakshadweep">Lakshadweep</option>
                                            <option value="Puducherry">Puducherry</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Pincode</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="6-digit pincode"
                                    value={formData.pincode}
                                    onChange={(e) => updateField("pincode", e.target.value)}
                                />
                            </div>

                            {/* Photo Upload Section */}
                            <div className="mt-8 pt-6 border-t border-[var(--border)]">
                                <label className="label flex items-center gap-2">
                                    <Camera className="w-4 h-4" />
                                    Photos of Business (Optional)
                                </label>
                                <p className="text-sm text-[var(--text-muted)] mb-4">
                                    Add up to 5 photos of your business location
                                </p>

                                {/* Photo Previews */}
                                {formData.photos.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {formData.photos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                                                <img
                                                    src={photo.preview}
                                                    alt={`Business photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Loading Overlay */}
                                                {photo.status === 'uploading' && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                            <span className="text-xs text-white font-medium">Uploading...</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Success Overlay */}
                                                {photo.status === 'success' && (
                                                    <div className="absolute bottom-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    </div>
                                                )}

                                                {/* Error Overlay with Retry */}
                                                {photo.status === 'error' && (
                                                    <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center gap-2">
                                                        <AlertCircle className="w-6 h-6 text-white" />
                                                        <span className="text-xs text-white font-medium">Upload failed</span>
                                                        <button
                                                            onClick={() => retryPhotoUpload(index)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-white text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors"
                                                        >
                                                            <RefreshCw className="w-3 h-3" />
                                                            Retry
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Remove Button (only when not uploading) */}
                                                {photo.status !== 'uploading' && (
                                                    <button
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                {formData.photos.length < 5 && (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full p-6 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all flex flex-col items-center gap-2"
                                        >
                                            <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-[var(--accent)]" />
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {formData.photos.length === 0 ? "Add Photos" : "Add More Photos"}
                                            </span>
                                            <span className="text-sm text-[var(--text-muted)]">
                                                {5 - formData.photos.length} remaining
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Procurement */}
                {step === 4 && (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Procurement Details</h1>
                        <p className="text-[var(--text-secondary)] mb-8">Help us understand how you currently procure</p>

                        <div className="space-y-6">
                            <div>
                                <label className="label">Current Procurement Method</label>
                                <select
                                    className="input"
                                    value={formData.procurementMethod}
                                    onChange={(e) => updateField("procurementMethod", e.target.value)}
                                >
                                    <option value="">Select method</option>
                                    <option value="single_vendor">Single Vendor</option>
                                    <option value="multiple_vendors">Multiple Vendors</option>
                                    <option value="wholesale_market">Wholesale Market</option>
                                    <option value="online">Online Platforms</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Monthly Procurement Budget (₹)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Minimum"
                                        value={formData.monthlyBudgetMin}
                                        onChange={(e) => updateField("monthlyBudgetMin", e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Maximum"
                                        value={formData.monthlyBudgetMax}
                                        onChange={(e) => updateField("monthlyBudgetMax", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Current Credit Period (days)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g., 15"
                                        value={formData.currentCreditPeriod}
                                        onChange={(e) => updateField("currentCreditPeriod", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Preferred Credit Period</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="e.g., 30"
                                        value={formData.preferredCreditPeriod}
                                        onChange={(e) => updateField("preferredCreditPeriod", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Pain Points with Current Vendors</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {painPointOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            onClick={() => togglePainPoint(option.key)}
                                            className={`p-3 rounded-lg text-sm text-left transition-all ${formData.painPoints.includes(option.key)
                                                ? "bg-[var(--accent)] text-white"
                                                : "bg-[var(--surface-hover)] hover:bg-[var(--accent)]/10"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Would you switch to a new vendor for better terms? *</label>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {["yes", "no", "maybe"].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => updateField("willingToSwitch", option)}
                                            className={`p-4 rounded-xl border-2 capitalize font-medium transition-all ${formData.willingToSwitch === option
                                                ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]"
                                                : "border-[var(--border)]"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Industry Specific - Now Dynamic! */}
                {step === 5 && (
                    <div className="animate-fadeIn">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">{selectedIndustry?.display_name} Details</h1>
                        <p className="text-[var(--text-secondary)] mb-8">Industry-specific information</p>

                        <div className="space-y-6">
                            {questionsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                                    <span className="ml-3 text-[var(--text-secondary)]">Loading questions...</span>
                                </div>
                            ) : industryQuestions.length > 0 ? (
                                <>
                                    {/* Render dynamic questions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {industryQuestions.map((q) => (
                                            <div key={q.id} className={q.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                                                <label className="label">
                                                    {q.label}
                                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                                </label>

                                                {/* Text input */}
                                                {q.field_type === 'text' && (
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder={q.placeholder || ''}
                                                        value={formData.industryData[q.field_key] as string || ''}
                                                        onChange={(e) => updateIndustryData(q.field_key, e.target.value)}
                                                    />
                                                )}

                                                {/* Number input */}
                                                {q.field_type === 'number' && (
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        placeholder={q.placeholder || ''}
                                                        value={formData.industryData[q.field_key] as number || ''}
                                                        onChange={(e) => updateIndustryData(q.field_key, parseInt(e.target.value) || 0)}
                                                    />
                                                )}

                                                {/* Select dropdown */}
                                                {q.field_type === 'select' && (
                                                    <select
                                                        className="input"
                                                        value={formData.industryData[q.field_key] as string || ''}
                                                        onChange={(e) => updateIndustryData(q.field_key, e.target.value)}
                                                    >
                                                        <option value="">Select an option</option>
                                                        {(q.options || []).map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Boolean toggle */}
                                                {q.field_type === 'boolean' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateIndustryData(q.field_key, true)}
                                                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.industryData[q.field_key] === true
                                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                                : 'border-[var(--border)]'
                                                                }`}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateIndustryData(q.field_key, false)}
                                                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.industryData[q.field_key] === false
                                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                                : 'border-[var(--border)]'
                                                                }`}
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Textarea */}
                                                {q.field_type === 'textarea' && (
                                                    <textarea
                                                        className="input min-h-[100px]"
                                                        placeholder={q.placeholder || ''}
                                                        value={formData.industryData[q.field_key] as string || ''}
                                                        onChange={(e) => updateIndustryData(q.field_key, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="card p-6 text-center bg-[var(--surface)]">
                                    <p className="text-[var(--text-secondary)]">
                                        No additional questions for this industry. You can proceed to submit!
                                    </p>
                                </div>
                            )}

                            {/* Additional notes - always show */}
                            <div className="mt-6 pt-6 border-t border-[var(--border)]">
                                <label className="label">Any additional notes or requirements?</label>
                                <textarea
                                    className="input min-h-[100px]"
                                    placeholder="Share any specific requirements or feedback..."
                                    value={formData.industryData.additionalNotes as string || ''}
                                    onChange={(e) => updateIndustryData("additionalNotes", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-12 pt-6 border-t border-[var(--border)]">
                    <button
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !formData.subCategory && availableSubCategories.length === 0) {
                                    updateField("subCategory", "general");
                                }
                                setStep((s) => Math.min(totalSteps, s + 1));
                            }}
                            disabled={!canProceed()}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn btn-accent"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Survey
                                    <CheckCircle className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
