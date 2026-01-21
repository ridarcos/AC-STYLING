"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function About() {
    const t = useTranslations('About');

    return (
        <section className="w-full py-8 md:py-12 bg-ac-sand text-ac-taupe scroll-mt-28" id="about">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                >
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-5xl mb-4 leading-tight text-ac-taupe">
                        {t('title')} <br />
                        <span className="italic text-ac-olive-dark">{t('title_accent')}</span>
                    </h2>

                    <div className="w-16 h-px bg-ac-taupe/20 mb-6"></div>

                    <p className="font-sans text-lg md:text-xl leading-relaxed text-ac-taupe/80 mb-6 max-w-2xl">
                        {t('description')}
                    </p>

                    <a
                        href="https://calendly.com/fashionstylist-ac/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-10 py-4 border border-ac-taupe text-ac-taupe font-sans text-xs uppercase tracking-[0.2em] hover:bg-ac-taupe hover:text-white transition-all duration-300"
                    >
                        {t('cta')}
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
