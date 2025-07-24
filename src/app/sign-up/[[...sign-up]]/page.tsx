"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const [isSignUpLoading, setIsSignUpLoading] = useState(true);
    const searchParams = useSearchParams();
    const redirectToken = searchParams.get("redirectToken");

    const redirectUrl = redirectToken
        ? `/connect?token=${redirectToken}`
        : "/";

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSignUpLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

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
                            <SignUp redirectUrl={redirectUrl} signInUrl={`/sign-in?redirectToken=${redirectToken || ""}`}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}