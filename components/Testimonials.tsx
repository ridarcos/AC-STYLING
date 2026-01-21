"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Testimonials() {
    const t = useTranslations('Testimonials');

    const testimonials = [
        {
            name: "Alexandra Dueck",
            location: "Toronto",
            text: t('t1.text'),
        },
        {
            name: "Bianca",
            location: "Caracas",
            text: t('t2.text'),
        },
        {
            name: "Manuel Gomez",
            location: "Miami",
            text: t('t3.text'),
        },
    ];

    return (
        <section className="w-full py-24 bg-[#C2B295] text-ac-charcoal" id="testimonials">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-5xl text-ac-charcoal mb-4">
                        {t('title')}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 md:p-10 shadow-lg relative flex flex-col h-full"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="font-serif text-lg leading-relaxed text-ac-charcoal mb-8 flex-grow">
                                {testimonial.text}
                            </p>

                            <div className="mt-auto">
                                <p className="font-bold text-ac-charcoal text-base uppercase tracking-wide">
                                    {testimonial.name}
                                </p>
                                <p className="text-gray-500 text-sm uppercase tracking-wider mt-1">
                                    {testimonial.location}
                                </p>
                            </div>

                            <Quote className="absolute bottom-8 right-8 w-8 h-8 text-gray-200 fill-gray-200" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
