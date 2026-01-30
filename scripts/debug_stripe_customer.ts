
import { Stripe } from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RkyNHGg4NoVaWzLE2TRVXigoOwDClRyrdlBuZplR4cefMwtu0oxLezPF7Sn7KlH91xmvWeP8iWtN3Av0e77BOx700nwzsVjPQ';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any });

const TARGET_EMAIL = 'manugomezwow@gmail.com';

async function main() {
    console.log(`Searching Stripe for email: ${TARGET_EMAIL}...`);

    try {
        // 1. Check for Customers
        const customers = await stripe.customers.list({
            email: TARGET_EMAIL,
            limit: 5
        });

        console.log(`Found ${customers.data.length} Customer(s):`);
        customers.data.forEach(c => console.log(` - ${c.id} (${c.email}) [Del: ${c.deleted}]`));

        if (customers.data.length === 0) {
            console.log("No Customer object found. This implies 'Guest Checkout' or 'Customer Creation Disabled'.");
        }

        // 2. Bruteforce search recent sessions (to find guest checkouts)
        console.log("\nFetching last 10 Checkout Sessions...");
        const sessions = await stripe.checkout.sessions.list({
            limit: 10,
            expand: ['data.line_items']
        });

        sessions.data.forEach(s => {
            const payerEmail = s.customer_details?.email || s.customer_email || 'N/A';
            const isMatch = payerEmail.toLowerCase() === TARGET_EMAIL.toLowerCase();
            const symbol = isMatch ? 'MATCH ->' : '       ';

            console.log(`${symbol} ${s.id} | Status: ${s.payment_status} | Payer: ${payerEmail} | Customer: ${s.customer}`);
            if (isMatch) {
                console.log(`         Product:`, s.line_items?.data[0]?.description);
            }
        });

    } catch (e: any) {
        console.error("Stripe Error:", e.message);
    }
}

main();
