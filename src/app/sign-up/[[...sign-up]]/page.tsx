"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
    const [isSignUpLoading, setIsSignUpLoading] = useState(true);
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSignUpLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isSignedIn) {
            const redirectToken = searchParams.get("redirectToken");
            if (redirectToken) {
                router.push(`/connect?token=${redirectToken}`);
            }
        }
    }, [isSignedIn, router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="p-4 bg-gray-900 rounded-lg shadow-xl mt-8">
                <h1 className="text-white text-3xl font-bold mb-4 text-center">
                    Sign up
                </h1>
                <div className="relative">
                    {isSignUpLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="transition-opacity duration-300">
                            <SignUp />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}