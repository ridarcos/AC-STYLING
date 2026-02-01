"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { processOnboarding } from "@/app/actions/onboarding";

export default function AuthConfirmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Verifying authentication...");

    // Params that might be in URL if PKCE or simple redirect
    const nextUrl = searchParams.get('next');

    useEffect(() => {
        const supabase = createClient();
        let mounted = true;

        const handleAuth = async () => {
            // 1. Wait for Supabase to detect session (handles Hash or Code automatically)
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                if (!mounted) return;
                setStatus("Finalizing your account...");

                // 2. Run Server-Side Onboarding (Profile Linking / Wardrobe Claim)
                try {
                    const result = await processOnboarding();
                    if (result.success) {
                        toast.success("Welcome to the Studio!");
                    } else {
                        // Non-blocking error
                        console.error("Onboarding warning:", result.error);
                    }
                } catch (err) {
                    console.error("Onboarding failed:", err);
                }

                // 3. Redirect
                const target = nextUrl || '/vault';
                router.replace(target); // Use replace to prevent back-button loop
            } else {
                // If no session found immediately, listen for event (Hash might take a ms to parse)
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        if (!mounted) return;
                        setStatus("Finalizing your account...");
                        await processOnboarding();
                        const target = nextUrl || '/vault';
                        router.replace(target);
                    } else if (event === 'SIGNED_OUT') {
                        // Do nothing, wait.
                    }
                });

                // Fallback timeout? 
                setTimeout(() => {
                    if (mounted && !session) {
                        // Check hash one last time manually? 
                        // If still nothing, maybe redirect to login?
                        // For now let's just wait, or user can click 'Login' manually if stuck.
                    }
                }, 5000);

                return () => subscription.unsubscribe();
            }
        };

        handleAuth();

        return () => { mounted = false; };
    }, [nextUrl, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6DED6]">
            <div className="text-center p-8">
                <Loader2 className="animate-spin h-10 w-10 text-[#3D3630] mx-auto mb-4" />
                <h2 className="text-xl font-serif text-[#3D3630] mb-2">Authenticated</h2>
                <p className="text-[#3D3630]/60 text-sm uppercase tracking-widest animate-pulse">
                    {status}
                </p>
            </div>
        </div>
    );
}
