"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
    name: string;
    location: string;
    text: string;
}

interface TestimonialCarouselProps {
    items: Testimonial[];
}

export default function TestimonialCarousel({ items }: TestimonialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, isPaused]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 2) % items.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 2 + items.length) % items.length);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    const currentTestimonial = items[currentIndex];

    return (
        <div
            className="relative w-full max-w-6xl mx-auto px-4 md:px-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative overflow-hidden min-h-[400px] flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {[0, 1].map((offset) => {
                            const index = (currentIndex + offset) % items.length;
                            const testimonial = items[index];
                            return (
                                <div key={index} className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm p-8 md:p-12 rounded-2xl relative flex flex-col items-center text-center h-full">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>

                                    <p className="font-serif text-lg md:text-xl leading-relaxed text-ac-taupe mb-8 italic flex-grow">
                                        "{testimonial.text}"
                                    </p>

                                    <div>
                                        <p className="font-bold text-ac-taupe text-lg uppercase tracking-wide">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-gray-500 text-sm uppercase tracking-wider mt-1">
                                            {testimonial.location}
                                        </p>
                                    </div>

                                    <Quote className="absolute top-8 left-8 w-8 h-8 text-ac-taupe/5 rotate-180" />
                                    <Quote className="absolute bottom-8 right-8 w-8 h-8 text-ac-taupe/5" />
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-ac-taupe/50 hover:text-ac-taupe transition-colors z-10"
                aria-label="Previous testimonial"
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ac-taupe/50 hover:text-ac-taupe transition-colors z-10"
                aria-label="Next testimonial"
            >
                <ChevronRight size={32} />
            </button>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(items.length / 2) }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            const newIndex = idx * 2;
                            setDirection(newIndex > currentIndex ? 1 : -1);
                            setCurrentIndex(newIndex);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${Math.floor(currentIndex / 2) === idx ? "bg-ac-taupe w-8" : "bg-ac-taupe/30"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
