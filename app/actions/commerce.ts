'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Checks if a user has purchased a specific product.
 */
export async function checkPurchase(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'completed')
        .single();

    return !!data;
}

/**
 * Gets all purchases for the current user.
 */
export async function getUserPurchases() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('purchases')
        .select('product_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

    return data?.map(p => p.product_id) || [];
}

/**
 * Simulates a purchase validation/creation (Stripe Webhook would usually do this).
 */
export async function purchaseProduct(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Check if already owned
    const isOwned = await checkPurchase(productId);
    if (isOwned) return { success: true, message: "Already owned" };

    try {
        const { error } = await supabase
            .from('purchases')
            .insert({
                user_id: user.id,
                product_id: productId,
                amount_paid: 99.00, // Dummy
                status: 'completed'
            });

        if (error) throw error;

        revalidatePath('/vault');
        return { success: true };
    } catch (err: any) {
        console.error("Purchase Error:", err);
        return { error: err.message };
    }
}
