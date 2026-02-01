'use server';

import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getMagicLinkHtml, getPasswordResetHtml } from '@/lib/email-templates';
import { headers } from 'next/headers';

export async function signInWithMagicLink(email: string) {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // 1. Generate Link
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error('Error generating magic link:', error);
        return { error: 'Could not generate login link. Please try again.' };
    }

    const { properties } = data;

    // 2. Send Email
    if (properties?.action_link) {
        const { success, error: emailError } = await sendEmail({
            to: email,
            subject: 'Sign in to AC Styling',
            html: getMagicLinkHtml(properties.action_link),
        });

        if (!success) {
            console.error('Error sending magic link email:', emailError);
            return { error: 'Failed to send email. Please try again.' };
        }
    }

    return { success: true };
}

export async function requestPasswordReset(email: string) {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // 1. Generate Link
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
            redirectTo: `${origin}/auth/callback?next=/update-password`,
        },
    });

    if (error) {
        console.error('Error generating recovery link:', error);
        return { error: 'Could not generate reset link. Please try again.' };
    }

    const { properties } = data;

    // 2. Send Email
    if (properties?.action_link) {
        const { success, error: emailError } = await sendEmail({
            to: email,
            subject: 'Reset your AC Styling Password',
            html: getPasswordResetHtml(properties.action_link),
        });

        if (!success) {
            console.error('Error sending reset email:', emailError);
            return { error: 'Failed to send email. Please try again.' };
        }
    }

    return { success: true };
}
