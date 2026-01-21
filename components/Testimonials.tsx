"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Testimonials() {
    const t = useTranslations('Testimonials');

    const testimonials = [
        {
            name: "Alexandra",
            location: "Toronto",
            text: t('t1.text'),
        },
        {
            name: "Bianca",
            location: "Caracas",
            text: t('t2.text'),
        },
        {
            name: "Manuel",
            location: "Miami",
            text: t('t3.text'),
        },
    ];

    return (
        <section className="w-full py-8 bg-ac-beige text-ac-taupe" id="testimonials">
            <div className="max-w-6xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ac-taupe mb-4">
                        {t('title')}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:-translate-y-1 p-6 md:p-8 relative flex flex-col h-full rounded-xl"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="font-serif text-lg leading-relaxed text-ac-taupe mb-8 flex-grow">
                                {testimonial.text}
                            </p>

                            <div className="mt-auto">
                                <p className="font-bold text-ac-taupe text-base uppercase tracking-wide">
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
