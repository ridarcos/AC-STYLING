"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Services() {
    const t = useTranslations('Services');

    const services = [
        {
            id: 1,
            title: t('personal_stylist.title'),
            description: t('personal_stylist.description')
        },
        {
            id: 2,
            title: t('personal_shopping.title'),
            description: t('personal_shopping.description')
        },
        {
            id: 3,
            title: t('closet_detox.title'),
            description: t('closet_detox.description')
        },
        {
            id: 4,
            title: t('corporate_consulting.title'),
            description: t('corporate_consulting.description')
        },
    ];

    return (
        <section className="w-full bg-ac-white py-24 md:py-32" id="services">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-20">
                    <span className="font-serif italic text-ac-gold text-xl mb-4">{t('section_title')}</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-ac-charcoal mb-8">{t('headline')}</h2>
                    <div className="w-12 h-px bg-ac-charcoal/20"></div>
                </div>

                {/* Service Grid - Clean & Minimal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {services.map((service, index) => (
                        <motion.a
                            key={service.id}
                            href="https://calendly.com/ridarcos/30min"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group flex flex-col p-8 md:p-10 border border-gray-100 hover:border-ac-gold/30 bg-ac-sand hover:shadow-lg transition-all duration-300 rounded-sm"
                        >
                            <h3 className="font-serif text-2xl text-ac-charcoal mb-4 group-hover:text-ac-gold transition-colors">
                                {service.title}
                            </h3>
                            <p className="font-sans text-ac-charcoal/70 leading-relaxed text-sm md:text-base mb-6 flex-grow">
                                {service.description}
                            </p>
                            <span className="text-xs uppercase tracking-widest text-ac-charcoal group-hover:underline decoration-ac-gold underline-offset-4 font-semibold">
                                {t('learn_more')}
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
