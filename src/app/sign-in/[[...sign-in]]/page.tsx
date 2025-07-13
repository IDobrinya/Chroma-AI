"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Page() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="p-4 bg-gray-900 rounded-lg shadow-xl mt-8">
                <h1 className="text-white text-3xl font-bold mb-4 text-center">
                    Sign in
                </h1>
                <div className="relative">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="transition-opacity duration-300">
                            <SignIn />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}