
'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type EssenceResponse = {
    question_key: string;
    answer_value: any;
    chapter_slug?: string;
    updated_at: string;
};

/**
 * Saves (Upserts) a user's answer to the essence_responses table.
 */
export async function saveEssenceResponse(
    masterclassId: string,
    chapterSlug: string,
    questionKey: string,
    answerValue: any
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Upsert logic
    // We match on (user_id, masterclass_id, question_key) due to UNIQUE constraint
    const { error } = await supabase
        .from('essence_responses')
        .upsert({
            user_id: user.id,
            masterclass_id: masterclassId,
            chapter_slug: chapterSlug,
            question_key: questionKey,
            answer_value: answerValue,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, masterclass_id, question_key'
        });

    if (error) {
        console.error("Save Essence Error:", error);
        return { success: false, error: error.message };
    }

    // Optional: Revalidate if we want immediate server-side reflection, 
    // but client optimistic updates usually handle this better for inputs.
    // revalidatePath(`/vault/foundations/${chapterSlug}`);

    return { success: true };
}

/**
 * Fetches all essence responses for a user in a specific masterclass.
 * Returns a map of question_key -> response object.
 */
export async function getEssenceProgress(masterclassId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {};
    }

    const { data, error } = await supabase
        .from('essence_responses')
        .select('question_key, answer_value, chapter_slug, updated_at')
        .eq('user_id', user.id)
        .eq('masterclass_id', masterclassId);

    if (error) {
        console.error("Fetch Essence Error:", error);
        return {};
    }

    // Transform into a Map-like object for easy O(1) lookup
    const responseMap: Record<string, EssenceResponse> = {};
    data?.forEach(row => {
        responseMap[row.question_key] = {
            question_key: row.question_key,
            answer_value: row.answer_value,
            chapter_slug: row.chapter_slug,
            updated_at: row.updated_at
        };
    });

    return responseMap;
}
