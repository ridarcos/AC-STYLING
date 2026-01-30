
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/stripe';

async function run() {
    console.log("Simulating Webhook with REAL IDs + MOCK LINE ITEMS...");

    const payload = {
        id: 'evt_sim_002',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_simulated_mocked',
                object: 'checkout.session',
                // REAL USER ID (Alejandra)
                client_reference_id: '7f03a907-6ac3-47e2-b202-79e11024e8aa',
                metadata: {
                    userId: '7f03a907-6ac3-47e2-b202-79e11024e8aa'
                },
                payment_status: 'paid',
                amount_total: 9900,
                currency: 'usd',
                // MOCK LINE ITEMS (Injected for our hacked route.ts)
                mock_line_items: [
                    {
                        amount_total: 9900,
                        currency: 'usd',
                        price: {
                            product: 'prod_TstAopEbflNwXR' // REAL PRODUCT ID (Color Mastery)
                        }
                    }
                ]
            }
        }
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-simulate-signature': 'true'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${text}`);

        if (response.status === 200) {
            console.log("SUCCESS: Webhook processed successfully.");
        } else {
            console.error("FAILURE: Webhook returned error.");
        }
    } catch (e: any) {
        console.error("Network Error:", e.message);
    }
}

run();
