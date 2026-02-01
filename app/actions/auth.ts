'use server';

import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getMagicLinkHtml, getPasswordResetHtml } from '@/lib/email-templates';
import { headers } from 'next/headers';

export async function signInWithMagicLink(email: string) {
    console.log('--- signInWithMagicLink START ---', email);
    const origin = (await headers()).get('origin');
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const supabase = createAdminClient();

    // 1. Generate Link
    console.log('Generating Magic Link...');
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

    console.log('Magic Link Generated. Properties:', data.properties ? 'Present' : 'Missing');
    const { properties } = data;

    // 2. Send Email
    if (properties?.action_link) {
        console.log('Sending Email to:', email);
        console.log('Action Link:', properties.action_link);

        const { success, error: emailError } = await sendEmail({
            to: email,
            subject: 'Sign in to AC Styling',
            html: getMagicLinkHtml(properties.action_link),
        });

        if (!success) {
            console.error('Error sending magic link email:', emailError);
            return { error: 'Failed to send email. Please try again.' };
        }
        console.log('Email sent successfully via Resend');
    } else {
        console.error('No action_link found in generateLink response', data);
        return { error: 'Failed to generate link (No Action Link)' };
    }

    console.log('--- signInWithMagicLink END ---');
    return { success: true };
}

export async function requestPasswordReset(email: string) {
    console.log('--- requestPasswordReset START ---', email);
    const origin = (await headers()).get('origin');
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const supabase = createAdminClient();

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
        console.log('Sending Reset Email to:', email);
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

export async function signUpWithMagicLink(email: string) {
    console.log('--- signUpWithMagicLink START ---', email);
    const origin = (await headers()).get('origin');
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const adminSupabase = createAdminClient();

    // 1. Try to generate Link (works if user exists)
    console.log('Attempting to generate link for existing user...');
    let { data, error } = await adminSupabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${origin}/auth/callback` }
    });

    // 2. If User Not Found, Create User First
    if (error && error.message.includes("User not found")) {
        console.log('User not found. Creating new user...');
        const { error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            email_confirm: true,
        });

        if (createError) {
            console.error("Error creating user:", createError);
            return { error: "Failed to create account." };
        }

        console.log('User created. Generating link...');
        const result = await adminSupabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: `${origin}/auth/callback` }
        });
        data = result.data;
        error = result.error;
    }

    if (error) {
        console.error('Error generating magic link:', error);
        return { error: 'Could not generate login link. Please try again.' };
    }

    console.log('Magic Link Generated. Properties:', data.properties ? 'Present' : 'Missing');
    const { properties } = data;

    // 3. Send Email
    if (properties?.action_link) {
        console.log('Sending Signup Email via Resend to:', email);
        console.log('Action Link:', properties.action_link);
        const { success, error: emailError } = await sendEmail({
            to: email,
            subject: 'Welcome to AC Styling',
            html: getMagicLinkHtml(properties.action_link),
        });

        if (!success) {
            console.error('Error sending magic link email:', emailError);
            return { error: 'Failed to send email. Please try again.' };
        }
        console.log('Email sent successfully.');
    } else {
        console.error('No action_link found in response', data);
    }

    console.log('--- signUpWithMagicLink END ---');
    return { success: true };
}

export async function signUpSeamless(formData: FormData, redirectTo: string) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!email || !password || !fullName) {
        return { error: 'Please fill in all fields.' };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
    });

    if (error) {
        console.error('Signup Error:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function linkIntakeProfile(token: string) {
    // Delegate to the robust activation logic in studio actions
    const { activateStudioAccess } = await import('@/app/actions/studio');
    return activateStudioAccess(token);
}
