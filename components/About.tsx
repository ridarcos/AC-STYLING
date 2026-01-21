"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function About() {
    const t = useTranslations('About');

    return (
        <section className="w-full py-24 md:py-32 bg-ac-sand text-ac-charcoal" id="about">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                >
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight text-ac-charcoal">
                        {t('title')} <br />
                        <span className="italic text-ac-gold">{t('title_accent')}</span>
                    </h2>

                    <div className="w-16 h-px bg-ac-charcoal/20 mb-10"></div>

                    <p className="font-sans text-lg md:text-xl leading-relaxed text-ac-charcoal/80 mb-12 max-w-2xl">
                        {t('description')}
                    </p>

                    <a
                        href="https://calendly.com/ridarcos/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-10 py-4 border border-ac-charcoal text-ac-charcoal font-sans text-xs uppercase tracking-[0.2em] hover:bg-ac-charcoal hover:text-white transition-all duration-300"
                    >
                        {t('cta')}
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
