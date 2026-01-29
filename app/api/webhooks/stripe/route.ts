import { headers } from 'next/headers';
import { stripe } from '@/utils/stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return new Response('Server Error', { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Use Admin Client to bypass RLS for Webhook operations
    const supabase = createAdminClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const finalUserId = userId || session.metadata?.userId;

        console.log(`[Stripe Webhook] Session Info: SessionID=${session.id}, UserID=${finalUserId}`);

        if (!finalUserId) {
            console.error('[Stripe Webhook] No userId found in session');
            return new Response('No userId', { status: 200 });
        }

        try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

            for (const item of lineItems.data) {
                // Handle both expanded object and string ID
                const stripeProductId = typeof item.price?.product === 'string'
                    ? item.price?.product
                    : (item.price?.product as any)?.id;

                console.log(`[Stripe Webhook] Processing Item: ProductID=${stripeProductId}, UserID=${finalUserId}`);

                if (!stripeProductId) continue;

                // 1. Log Purchase
                const { error: purchaseError } = await supabase.from('purchases').insert({
                    user_id: finalUserId,
                    product_id: stripeProductId,
                    amount_paid: item.amount_total ? item.amount_total / 100 : 0,
                    currency: item.currency?.toUpperCase() || 'USD',
                    status: 'completed'
                });

                if (purchaseError) console.error('[Stripe Webhook] Purchase Insert Error:', purchaseError);

                // 2. Grant Access Logic
                const FULL_UNLOCK_PRODUCT_ID = process.env.STRIPE_FULL_ACCESS_PRODUCT_ID;

                if (stripeProductId === FULL_UNLOCK_PRODUCT_ID) {
                    // Check Legacy ENV first
                    console.log('[Stripe Webhook] Granting FULL ACCESS (Env Match)');
                    await supabase.from('profiles')
                        .update({ has_full_unlock: true })
                        .eq('id', finalUserId);
                } else {
                    // Check if matched to dynamic Offer (Full Access)
                    const { data: offer } = await supabase
                        .from('offers')
                        .select('slug')
                        .eq('stripe_product_id', stripeProductId)
                        .eq('active', true)
                        .maybeSingle();

                    if (offer && offer.slug === 'full_access') {
                        console.log('[Stripe Webhook] Granting FULL ACCESS (Offer Match)');
                        await supabase.from('profiles')
                            .update({ has_full_unlock: true })
                            .eq('id', finalUserId);
                        continue;
                    }

                    if (offer && offer.slug === 'course_pass') {
                        console.log('[Stripe Webhook] Granting COURSE PASS (Offer Match)');
                        await supabase.from('profiles')
                            .update({ has_course_pass: true })
                            .eq('id', finalUserId);
                        continue;
                    }

                    // Try Masterclass
                    const { data: masterclass, error: mcError } = await supabase
                        .from('masterclasses')
                        .select('id, title')
                        .eq('stripe_product_id', stripeProductId)
                        .maybeSingle();

                    if (masterclass) {
                        console.log(`[Stripe Webhook] Matched Masterclass: ${masterclass.title} (${masterclass.id})`);
                        const { error: grantError } = await supabase.from('user_access_grants').insert({
                            user_id: finalUserId,
                            masterclass_id: masterclass.id,
                            grant_type: 'purchase'
                        });
                        if (grantError) console.error('[Stripe Webhook] Masterclass Grant Error:', grantError);
                        else console.log('[Stripe Webhook] Masterclass Grant SUCCESS');
                        continue;
                    } else if (mcError) {
                        // Only log real errors, not "no rows found" if handled by maybeSingle
                        console.error('[Stripe Webhook] Masterclass lookup error:', mcError);
                    }

                    // Try Chapter/Course
                    const { data: chapter, error: chError } = await supabase
                        .from('chapters')
                        .select('id, title')
                        .eq('stripe_product_id', stripeProductId)
                        .maybeSingle();

                    if (chapter) {
                        console.log(`[Stripe Webhook] Matched Chapter: ${chapter.title} (${chapter.id})`);
                        const { error: grantError } = await supabase.from('user_access_grants').insert({
                            user_id: finalUserId,
                            chapter_id: chapter.id,
                            grant_type: 'purchase'
                        });
                        if (grantError) console.error('[Stripe Webhook] Chapter Grant Error:', grantError);
                        else console.log('[Stripe Webhook] Chapter Grant SUCCESS');
                        continue;
                    } else if (chError) {
                        console.error('[Stripe Webhook] Chapter lookup error:', chError);
                    }

                    console.log(`[Stripe Webhook] No matching content found for Product ID: ${stripeProductId}`);
                }
            }
        } catch (err: any) {
            console.error('Error processing checkout session:', err);
            return new Response('Error processing session', { status: 500 });
        }
    }

    return new Response('Received', { status: 200 });
}
