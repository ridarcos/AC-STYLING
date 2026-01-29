"use server";

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function extractUrlMetadata(url: string) {
    if (!url) return null;

    // Helper to clean text
    const clean = (str: string | undefined | null) => str ? str.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ') : "";

    try {
        const browser = await puppeteer.launch({
            headless: true, // "new" is deprecated, true is current standard
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Mock a real user agent - REMOVED: Using default browser UA is more consistent for anti-bot
        // await page.setUserAgent('Mozilla/5.0 ...');

        // Go to URL and wait for meaningful content
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Extract metadata using page evaluation (runs in browser context)
        const metadata = await page.evaluate(() => {
            const getMeta = (props: string[]) => {
                for (const prop of props) {
                    const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
                    if (el) return el.getAttribute('content');
                }
                return null;
            };

            const title =
                getMeta(['og:title', 'twitter:title', 'title']) ||
                document.title ||
                document.querySelector('h1')?.innerText;

            // Strategy: Gather ALL valid images
            const images = new Set<string>();

            // 1. OG Image (High priority default)
            const ogImage = getMeta(['og:image', 'twitter:image', 'image']);
            if (ogImage) images.add(ogImage);

            // 2. Schema.org (JSON-LD) - Gold standard for e-commerce
            try {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                scripts.forEach(script => {
                    try {
                        const json = JSON.parse(script.innerHTML);
                        // Access JSON-LD nodes
                        const items = Array.isArray(json) ? json : [json];
                        items.forEach(item => {
                            if (item.image) {
                                if (Array.isArray(item.image)) {
                                    item.image.forEach((img: string) => images.add(img));
                                } else if (typeof item.image === 'string') {
                                    images.add(item.image);
                                } else if (item.image.url) {
                                    images.add(item.image.url);
                                }
                            }
                        });
                    } catch (e) { }
                });
            } catch (e) { }

            // 3. Fallbacks
            const linkImg = document.querySelector<HTMLElement>('link[rel="image_src"]')?.getAttribute('href');
            if (linkImg) images.add(linkImg);

            // Return array
            return {
                title,
                images: Array.from(images),
                description: getMeta(['og:description', 'twitter:description', 'description']),
                siteName: getMeta(['og:site_name', 'site_name'])
            };
        });

        await browser.close();

        // Clean and validate
        return {
            title: clean(metadata.title),
            images: metadata.images, // Pass full array
            image: metadata.images[0] || "", // Default to first
            description: clean(metadata.description),
            siteName: clean(metadata.siteName)
        };

    } catch (error) {
        console.error("Puppeteer Extraction Error:", error);
        return null;
    }
}

export async function updateProfileStatus(profileId: string, status: 'active' | 'archived') {
    const { createClient } = await import("@/utils/supabase/server");
    const { revalidatePath } = await import("next/cache");
    const supabase = await createClient();

    // 1. Check if Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', profileId);

        if (error) throw error;

        revalidatePath('/[locale]/vault/studio', 'page');
        return { success: true };
    } catch (err: any) {
        console.error("Update Status Error:", err);
        return { success: false, error: err.message };
    }
}

export async function permanentDeleteProfile(profileId: string) {
    const { createClient } = await import("@/utils/supabase/server");
    const { revalidatePath } = await import("next/cache");
    const supabase = await createClient();

    // 1. Check if Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        // FKs are ON DELETE CASCADE in studio_schema, so this should wipe assets/lookbooks too
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId);

        if (error) throw error;

        revalidatePath('/[locale]/vault/studio', 'page');
        return { success: true };
    } catch (err: any) {
        console.error("Delete Profile Error:", err);
        return { success: false, error: err.message };
    }
}
