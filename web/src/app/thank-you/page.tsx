"use client";

import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const surveyId = searchParams.get("id");

    return (
        <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                Thank You!
            </h1>

            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
                Your survey response has been recorded successfully. We appreciate your time and valuable input.
            </p>

            {surveyId && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg inline-block">
                    <p className="text-sm text-gray-500">Reference ID</p>
                    <p className="font-mono font-medium">{surveyId}</p>
                </div>
            )}

            <div className="flex justify-center gap-4">
                <Link href="/" className="btn btn-primary flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
            <Suspense fallback={<div>Loading...</div>}>
                <ThankYouContent />
            </Suspense>
        </main>
    );
}
