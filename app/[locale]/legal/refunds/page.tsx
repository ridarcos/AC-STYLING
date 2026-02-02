
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund Policy | AC Styling',
    description: 'Refund Policy for AC Styling services and website.',
};

export default function RefundsPage() {
    return (
        <article className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-ac-taupe prose-p:text-ac-taupe/80 prose-a:text-ac-espresso hover:prose-a:text-ac-taupe">
            <h1 className="font-serif text-4xl mb-4">REFUND POLICY</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated February 01, 2026</p>

            <h2>Digital Products</h2>
            <p>
                Due to the nature of digital products (such as Masterclasses, "The Vault" content, and downloadable guides), all sales are final. We do not offer refunds on digital goods once they have been purchased and access has been granted.
            </p>

            <h2>Consulting Services</h2>
            <p>
                We strive to provide adequate notice and flexibility for rescheduling. Refunds for booked sessions are handled on a case-by-case basis, subject to our cancellation policy provided at the time of booking.
            </p>
            <p>
                If you are unsatisfied with a service, please contact us immediately so we can address your concerns.
            </p>

            <h2>Contact Us</h2>
            <p>
                If you have any questions about our Refunds Policy, please contact us at <a href="mailto:fashionstylist.ac@gmail.com">fashionstylist.ac@gmail.com</a>.
            </p>
        </article>
    );
}
