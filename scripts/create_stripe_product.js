
const Stripe = require('stripe');

// Hardcoded for script reliability
const STRIPE_SECRET_KEY = 'sk_test_51RkyNHGg4NoVaWzLE2TRVXigoOwDClRyrdlBuZplR4cefMwtu0oxLezPF7Sn7KlH91xmvWeP8iWtN3Av0e77BOx700nwzsVjPQ';

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function main() {
    console.log('Creating Test Product in Stripe (JavaScript mode)...');

    try {
        // 1. Create Product
        const product = await stripe.products.create({
            name: 'AC Styling - Test Masterclass (JS)',
            description: 'A test product created via Admin Script.',
            images: ['https://images.unsplash.com/photo-1490481651871-ab52661227ed?q=80&w=2070&auto=format&fit=crop'],
        });

        console.log(`✅ Product Created: ${product.name}`);
        console.log(`   ID: ${product.id}`);

        // 2. Create Price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 5000, // $50.00
            currency: 'usd',
            recurring: undefined, // One-time purchase
        });

        console.log(`✅ Price Created: $50.00 USD`);
        console.log(`   ID: ${price.id}`);

        const fs = require('fs');
        const output = `stripe_product_id: ${product.id}\nprice_id: ${price.id}`;
        fs.writeFileSync('stripe_ids.txt', output);
        console.log('✅ SAVED TO stripe_ids.txt');
        console.log(output);

    } catch (err) {
        console.error('❌ Error creating product:', err.message);
    }
}

main();
