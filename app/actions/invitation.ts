"use server";

import { createClient } from "@/utils/supabase/server";

export interface GenerateInvitationResult {
    success: boolean;
    token?: string;
    error?: string;
}

export async function generateInvitation(
    fullname: string,
    email: string = "",
    note: string = ""
): Promise<GenerateInvitationResult> {
    const supabase = await createClient();

    // 1. Check if Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        // 2. Generate Token and ID
        const intakeToken = crypto.randomUUID();
        const tempId = crypto.randomUUID();

        // 3. Create Pending Profile
        // We use a specific ID to allow RLS to work if we ever want to "claim" this later
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: tempId,
                full_name: fullname,
                email: email, // Optional, for reference
                is_guest: true, // It's a guest untill they sign up
                role: 'user',
                intake_token: intakeToken,
                // We could add a 'status' column later, but is_guest + intake_token implies pending
            });

        if (error) {
            console.error("DB Error:", error);
            throw new Error(error.message);
        }

        return { success: true, token: intakeToken };

    } catch (err: any) {
        console.error("Invitation Error:", err);
        return { success: false, error: err.message };
    }
}
