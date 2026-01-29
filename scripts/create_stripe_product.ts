
import { stripe } from '../utils/stripe';

async function main() {
    console.log('Creating Test Product in Stripe...');

    try {
        // 1. Create Product
        const product = await stripe.products.create({
            name: 'AC Styling - Test Masterclass',
            description: 'A test product created via API script to verify Stripe integration.',
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

        console.log('\n--- ACTION REQUIRED ---');
        console.log('Copy these IDs to your Admin Panel or Supabase Database:');
        console.log(`stripe_product_id: ${product.id}`);
        console.log(`price_id:          ${price.id}`);

    } catch (err: any) {
        console.error('❌ Error creating product:', err.message);
    }
}

main();
