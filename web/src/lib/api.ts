const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5001/api';

interface RequestOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Industry APIs
export const industriesApi = {
    getAll: () => request<{ success: boolean; data: Industry[] }>('/industries'),
    getOne: (key: string) => request<{ success: boolean; data: Industry }>(`/industries/${key}`),
};

// Survey APIs
export const surveysApi = {
    create: (data: SurveySubmission) =>
        request<{ success: boolean; data: Survey }>('/surveys', { method: 'POST', body: data }),
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<{ success: boolean; data: Survey[]; total: number; pages: number }>(`/surveys${query}`);
    },
    getOne: (id: string) => request<{ success: boolean; data: Survey }>(`/surveys/${id}`),
};

// Analytics APIs
export const analyticsApi = {
    getOverview: () => request<{ success: boolean; data: OverviewData }>('/analytics/overview'),
    getByIndustry: () => request<{ success: boolean; data: IndustryAnalytics[] }>('/analytics/by-industry'),
    getByLocation: () => request<{ success: boolean; data: LocationData }>('/analytics/by-location'),
    getProcurement: () => request<{ success: boolean; data: ProcurementData }>('/analytics/procurement'),
    getTimeline: (days?: number) =>
        request<{ success: boolean; data: TimelineData[] }>(`/analytics/timeline?days=${days || 30}`),
};

// Auth APIs
export const authApi = {
    login: (email: string, password: string) =>
        request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
            method: 'POST',
            body: { email, password }
        }),
    getMe: () => request<{ success: boolean; data: User }>('/auth/me'),
};

// Types
export interface Industry {
    _id: string;
    industryKey: string;
    displayName: string;
    icon: string;
    description: string;
    subCategories: SubCategory[];
    questions: Question[];
    commonItems: CommonItem[];
}

export interface SubCategory {
    key: string;
    displayName: string;
    subTypes: { key: string; displayName: string }[];
}

export interface Question {
    fieldKey: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'range';
    options?: string[];
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    order: number;
}

export interface CommonItem {
    category: string;
    items: { name: string; unit: string }[];
}

export interface Survey {
    _id: string;
    surveyId: string;
    business: {
        name: string;
        industry: string;
        subCategory: string;
        ownerName?: string;
        contactPhone?: string;
        address?: {
            city?: string;
            state?: string;
        };
    };
    currentProcurement?: {
        monthlyBudget?: { min: number; max: number };
        preferredCreditPeriod?: number;
        willingToSwitch?: string;
    };
    meta: {
        source: string;
        status: string;
        submittedAt: string;
    };
}

export interface SurveySubmission {
    business: {
        name: string;
        industry: string;
        subCategory: string;
        subType?: string;
        ownerName?: string;
        contactPhone?: string;
        contactEmail?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            pincode?: string;
        };
        location?: {
            coordinates: [number, number];
        };
        locationSource?: string;
    };
    currentProcurement?: {
        method?: string;
        monthlyBudget?: { min: number; max: number };
        preferredCreditPeriod?: number;
        painPoints?: string[];
        willingToSwitch?: string;
    };
    industryData?: Record<string, unknown>;
    recurringItems?: {
        category: string;
        itemName: string;
        quantity?: number;
        unit?: string;
        frequency?: string;
    }[];
    meta: {
        source: 'website' | 'mobile_app';
    };
}

export interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
}

export interface OverviewData {
    totals: { all: number; today: number; thisWeek: number; thisMonth: number };
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    recentSurveys: Survey[];
}

export interface IndustryAnalytics {
    _id: string;
    total: number;
    subCategories: { name: string; count: number }[];
    avgCreditPeriod: number;
}

export interface LocationData {
    distribution: { _id: string; count: number }[];
    geoPoints: { coordinates: [number, number]; industry: string; city: string }[];
}

export interface ProcurementData {
    paymentMethods: { _id: string; count: number }[];
    painPoints: { _id: string; count: number }[];
    switchWillingness: Record<string, number>;
    budgetRanges: { _id: string; avgMin: number; avgMax: number; count: number }[];
}

export interface TimelineData {
    date: string;
    count: number;
    industryCount: number;
}
