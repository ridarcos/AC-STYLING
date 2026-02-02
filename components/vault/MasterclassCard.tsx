"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Layers, Check, PlayCircle, X } from "lucide-react";

interface MasterclassCardProps {
    masterclass: any;
    locale: string;
    isGuest: boolean;
    isCompleted: boolean;
    index: number;
    t: any; // Translations object or function
    href: string;
}

export default function MasterclassCard({
    masterclass,
    locale,
    isGuest,
    isCompleted,
    index,
    t,
    href
}: MasterclassCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const displayTitle = locale === 'es' && masterclass.title_es ? masterclass.title_es : masterclass.title;
    const displaySubtitle = locale === 'es' && masterclass.subtitle_es ? masterclass.subtitle_es : masterclass.subtitle;
    const displayThumb = masterclass.thumbnail_url;
    const videoUrl = masterclass.video_url;

    // We render the card content. 
    // If NOT playing, it's wrapped in a Link (handled by parent or here).
    // To handle the "Play" click without navigating, we need control.
    // So we will render the Link ourselves for the text/image parts, but manage the video separate or stop propagation.

    return (
        <div className="group block relative">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm mb-3 shadow-md group-hover:shadow-xl transition-all duration-500 bg-black">
                {isPlaying && videoUrl ? (
                    <div className="absolute inset-0 z-50 bg-black animate-in fade-in">
                        <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            playsInline
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsPlaying(false);
                            }}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80 z-50"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <Link href={href} className="block w-full h-full relative">
                        <div className="absolute inset-0 bg-ac-taupe/20 group-hover:bg-ac-taupe/0 transition-colors z-10" />
                        <img
                            src={displayThumb || "https://images.unsplash.com/photo-1490481651871-ab52661227ed?q=80&w=2070&auto=format&fit=crop"}
                            alt={displayTitle}
                            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isGuest ? 'blur-[2px] grayscale' : 'grayscale group-hover:grayscale-0'}`}
                        />

                        {/* Guest Overlay */}
                        {isGuest && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/20 backdrop-blur-[1px]">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                                    <Layers size={18} className="text-white" />
                                </div>
                                <span className="text-white text-[10px] uppercase font-bold tracking-widest">Founding Members Only</span>
                            </div>
                        )}

                        {/* View Button (Only if NOT guest and NO video, or just always show view if not playing video) */}
                        {!isGuest && !videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 text-white font-serif tracking-widest">
                                    VIEW COLLECTION
                                </div>
                            </div>
                        )}

                        {/* Video Play Button (Teaser) */}
                        {videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsPlaying(true);
                                    }}
                                    className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/40 text-white hover:bg-ac-gold/20 hover:border-ac-gold transition-all pointer-events-auto group-hover:scale-110"
                                >
                                    <PlayCircle size={32} />
                                </button>
                            </div>
                        )}

                        {/* Badge - Label */}
                        <div className="absolute top-4 left-4 z-30 pointer-events-none">
                            <span className="bg-ac-gold text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest rounded-sm">
                                COLLECTION {index + 1}
                            </span>
                        </div>

                        {/* Completion Badge */}
                        <div className="absolute top-4 right-4 z-30 pointer-events-none">
                            {isCompleted && !isGuest && (
                                <div className="w-8 h-8 rounded-full bg-ac-olive flex items-center justify-center shadow-md ring-1 ring-white/20">
                                    <Check size={16} className="text-ac-gold" />
                                </div>
                            )}
                        </div>
                    </Link>
                )}
            </div>

            <Link href={href} className="block group">
                <h3 className="font-serif text-2xl text-ac-taupe group-hover:text-ac-olive transition-colors mb-1 flex items-center gap-2">
                    {displayTitle}
                    {isGuest && <span className="text-[10px] bg-ac-taupe/10 px-2 py-0.5 rounded-sm text-ac-taupe/60 uppercase font-bold tracking-normal">Locked</span>}
                </h3>
                <p className="text-ac-taupe/60 text-xs max-w-md line-clamp-2">
                    {displaySubtitle}
                </p>
            </Link>
        </div>
    );
}
