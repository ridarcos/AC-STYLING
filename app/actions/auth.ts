'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signUpSeamless(formData: FormData, redirectPath: string = '/vault', token?: string) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const supabase = await createClient();

    // 1. Sign Up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.session) {
        // Success - Link Token if provided
        if (token) {
            await linkIntakeProfile(token);
        }
        redirect(redirectPath);
    } else if (data.user && !data.session) {
        return { error: "Please verify your email to continue." };
    }

    return { error: "Unknown error occurred." };
}

// ... convertGuestAccount ...

export async function linkIntakeProfile(token: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Use Admin Client for Transfer (Bypass RLS)
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const adminSupabase = createAdminClient();

    // 1. Find the "Invite Profile"
    const { data: inviteProfile, error: inviteError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('intake_token', token)
        .neq('id', user.id)
        .single(); // Use admin to find it even if RLS hides it

    if (!inviteProfile) {
        return { message: "Token already processed or invalid." };
    }

    // 2. Wardrobe Logic: Ensure user has a wardrobe and items are linked
    let targetWardrobeId: string | null = null;

    // Check if guest already has a wardrobe
    const { data: guestWardrobe } = await adminSupabase.from('wardrobes').select('id').eq('owner_id', inviteProfile.id).maybeSingle();

    if (guestWardrobe) {
        // Transfer existing wardrobe
        await adminSupabase.from('wardrobes').update({ owner_id: user.id }).eq('id', guestWardrobe.id);
        targetWardrobeId = guestWardrobe.id;
    } else {
        // Create new wardrobe if none exists
        const { data: newWardrobe } = await adminSupabase.from('wardrobes').insert({
            owner_id: user.id,
            title: `${inviteProfile.full_name || 'My'} Wardrobe`,
            status: 'active'
        }).select('id').single();
        if (newWardrobe) targetWardrobeId = newWardrobe.id;
    }

    // 3. Transfer Data & Link to Wardrobe
    if (targetWardrobeId) {
        await adminSupabase.from('wardrobe_items')
            .update({ user_id: user.id, wardrobe_id: targetWardrobeId })
            .eq('user_id', inviteProfile.id);
    } else {
        await adminSupabase.from('wardrobe_items').update({ user_id: user.id }).eq('user_id', inviteProfile.id);
    }

    await adminSupabase.from('tailor_cards').update({ user_id: user.id }).eq('user_id', inviteProfile.id);
    await adminSupabase.from('lookbooks').update({ user_id: user.id }).eq('user_id', inviteProfile.id);

    // 4. Update Current Profile Permissions
    await adminSupabase
        .from('profiles')
        .update({
            active_studio_client: true,
            studio_permissions: inviteProfile.studio_permissions || { lookbook: true, wardrobe: true },
            intake_token: token
        })
        .eq('id', user.id);

    // 5. Delete the Invite Profile (Cleanup)
    const { error: deleteError } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', inviteProfile.id);

    if (deleteError) {
        console.error("Cleanup Error:", deleteError);
        // Fallback: Archive it if delete fails
        await adminSupabase.from('profiles').update({ status: 'archived' }).eq('id', inviteProfile.id);
    }

    return { success: true };
}
