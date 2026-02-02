
import ConciergeNavbar from "@/components/ConciergeNavbar";
import { createClient } from "@/utils/supabase/server";

export default async function VaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = !user || user.is_anonymous;

    return (
        <div className="min-h-screen bg-ac-sand pb-20">
            <ConciergeNavbar isGuest={isGuest} />
            <main className="pt-24 container mx-auto px-6 md:px-12">
                {children}
            </main>
        </div>
    );
}
