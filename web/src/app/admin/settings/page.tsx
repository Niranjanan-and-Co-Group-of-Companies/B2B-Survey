"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Bell,
    Globe,
    Moon,
    Sun,
    Shield,
    Database,
    Key,
    Mail,
    Check,
    AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        // General
        companyName: "B2B Survey Platform",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        currency: "INR",

        // Notifications
        emailNotifications: true,
        surveyAlerts: true,
        weeklyReports: false,
        notificationEmail: "",

        // Theme
        darkMode: false,

        // Security
        sessionTimeout: 60,
        twoFactorAuth: false,
    });

    const handleSave = async () => {
        setSaving(true);
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: "general", label: "General", icon: Globe },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "database", label: "Database", icon: Database },
    ];

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
                    <p className="text-[var(--text-secondary)]">
                        Manage your application preferences
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <Check className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs */}
                <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? "bg-[var(--accent)] text-white"
                                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* General */}
                    {activeTab === "general" && (
                        <div className="card p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                General Settings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.companyName}
                                        onChange={(e) =>
                                            setSettings({ ...settings, companyName: e.target.value })
                                        }
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Timezone
                                    </label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) =>
                                            setSettings({ ...settings, timezone: e.target.value })
                                        }
                                        className="input w-full"
                                    >
                                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Date Format
                                    </label>
                                    <select
                                        value={settings.dateFormat}
                                        onChange={(e) =>
                                            setSettings({ ...settings, dateFormat: e.target.value })
                                        }
                                        className="input w-full"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) =>
                                            setSettings({ ...settings, currency: e.target.value })
                                        }
                                        className="input w-full"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {settings.darkMode ? (
                                            <Moon className="w-5 h-5 text-[var(--accent)]" />
                                        ) : (
                                            <Sun className="w-5 h-5 text-yellow-500" />
                                        )}
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">Dark Mode</p>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                Use dark theme for the admin panel
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setSettings({ ...settings, darkMode: !settings.darkMode })
                                        }
                                        className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? "bg-[var(--accent)]" : "bg-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === "notifications" && (
                        <div className="card p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Notification Preferences
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Notification Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="email"
                                        value={settings.notificationEmail}
                                        onChange={(e) =>
                                            setSettings({ ...settings, notificationEmail: e.target.value })
                                        }
                                        placeholder="admin@example.com"
                                        className="input w-full pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        key: "emailNotifications",
                                        label: "Email Notifications",
                                        desc: "Receive email updates about new surveys",
                                    },
                                    {
                                        key: "surveyAlerts",
                                        label: "Survey Alerts",
                                        desc: "Get notified when a new survey is submitted",
                                    },
                                    {
                                        key: "weeklyReports",
                                        label: "Weekly Reports",
                                        desc: "Receive weekly summary reports via email",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSettings({
                                                    ...settings,
                                                    [item.key]: !settings[item.key as keyof typeof settings],
                                                })
                                            }
                                            className={`w-12 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings]
                                                    ? "bg-[var(--accent)]"
                                                    : "bg-gray-300"
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings[item.key as keyof typeof settings]
                                                        ? "translate-x-6"
                                                        : "translate-x-0.5"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === "security" && (
                        <div className="card p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Security Settings
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) =>
                                        setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                                    }
                                    min={5}
                                    max={480}
                                    className="input w-full"
                                />
                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                    Users will be logged out after this period of inactivity
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Key className="w-5 h-5 text-[var(--accent)]" />
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">
                                            Two-Factor Authentication
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Add an extra layer of security
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })
                                    }
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? "bg-[var(--accent)]" : "bg-gray-300"
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.twoFactorAuth ? "translate-x-6" : "translate-x-0.5"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-yellow-800">Password Policy</p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Passwords must be at least 8 characters long and include a mix of
                                            letters, numbers, and special characters.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Database */}
                    {activeTab === "database" && (
                        <div className="card p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Database Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--surface-hover)] rounded-xl">
                                    <p className="text-sm text-[var(--text-secondary)]">Provider</p>
                                    <p className="font-semibold text-[var(--text-primary)] mt-1">Supabase</p>
                                </div>
                                <div className="p-4 bg-[var(--surface-hover)] rounded-xl">
                                    <p className="text-sm text-[var(--text-secondary)]">Status</p>
                                    <p className="font-semibold text-green-600 mt-1 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Connected
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--surface-hover)] rounded-xl">
                                    <p className="text-sm text-[var(--text-secondary)]">Project</p>
                                    <p className="font-mono text-sm text-[var(--text-primary)] mt-1">
                                        vrdzshtlemgkmocheurp
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--surface-hover)] rounded-xl">
                                    <p className="text-sm text-[var(--text-secondary)]">Region</p>
                                    <p className="font-semibold text-[var(--text-primary)] mt-1">
                                        Asia Pacific (Mumbai)
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> Database configuration is managed through the
                                    Supabase dashboard. Visit{" "}
                                    <a
                                        href="https://supabase.com/dashboard"
                                        target="_blank"
                                        className="underline"
                                    >
                                        supabase.com/dashboard
                                    </a>{" "}
                                    to manage tables, policies, and more.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
