
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | AC Styling',
    description: 'Terms of Service for AC Styling services and website.',
};

export default function TermsPage() {
    return (
        <article className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-ac-taupe prose-p:text-ac-taupe/80 prose-a:text-ac-espresso hover:prose-a:text-ac-taupe">
            <h1 className="font-serif text-4xl mb-4">TERMS OF SERVICE</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated February 01, 2026</p>

            <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the AC Styling website and services (the "Service") operated by AC Styling ("us", "we", or "our").
            </p>

            <h2>1. Conditions of Use</h2>
            <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use AC Styling if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2>2. License</h2>
            <p>
                Unless otherwise stated, AC Styling and/or its licensors own the intellectual property rights for all material on AC Styling. All intellectual property rights are reserved. You may access this from AC Styling for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <p>You must not:</p>
            <ul>
                <li>Republish material from AC Styling</li>
                <li>Sell, rent or sub-license material from AC Styling</li>
                <li>Reproduce, duplicate or copy material from AC Styling</li>
                <li>Redistribute content from AC Styling</li>
            </ul>

            <h2>3. Disclaimer</h2>
            <p>
                The materials on AC Styling's website are provided on an 'as is' basis. AC Styling makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>4. Consulting Services</h2>
            <p>
                AC Styling provides digital fashion consulting and educational content. All styling advice is subjective and intended for informational and aesthetic purposes. The Client retains full discretion over all purchasing decisions.
            </p>

            <h2>5. Governing Law</h2>
            <p>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which AC Styling operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:fashionstylist.ac@gmail.com">fashionstylist.ac@gmail.com</a>.
            </p>
        </article>
    );
}
