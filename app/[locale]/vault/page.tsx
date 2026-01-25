import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import VaultHero from "@/components/vault/VaultHero";
import QuickActions from "@/components/vault/QuickActions";
import WhatsNew from "@/components/vault/WhatsNew";
import { getDashboardPulse, getMasterclassCompletionStatus } from "@/app/actions/dashboard";

export default async function VaultPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile and dynamic content concurrently
    const [profileRes, pulse, completion] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        getDashboardPulse(),
        getMasterclassCompletionStatus()
    ]);

    const profile = profileRes.data;

    // Fetch profile
    let fullName = "Guest";
    if (profile?.full_name) {
        fullName = profile.full_name;
    } else {
        // Fallback to metadata if profile is not yet created/synced
        fullName = user.user_metadata?.full_name || "Style Icon";
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Simple Greeting Header */}
            <div className="fade-in-up">
                <h1 className="font-serif text-3xl md:text-4xl text-ac-taupe">
                    Welcome back, {fullName}
                </h1>
            </div>

            {/* Main Content Grid: WhatsNew (Left) + QuickActions (Right Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Main: What's New takes 3 cols */}
                <div className="lg:col-span-3">
                    <WhatsNew pulse={pulse} />
                </div>

                <div className="lg:col-span-1">
                    <QuickActions isMasterclassComplete={completion.isComplete} />
                </div>
            </div>

            {/* Footer: Recommendations removed per user request */}
        </div>
    );
}
