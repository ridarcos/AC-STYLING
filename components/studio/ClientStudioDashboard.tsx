"use client";

import { useState } from "react";
import { Sparkles, Shirt, BookOpen, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VirtualWardrobe from "@/components/studio/VirtualWardrobe";
import DigitalLookbook from "@/components/studio/DigitalLookbook";
import TailorCardUser from "@/components/vault/TailorCardUser";

interface ClientStudioDashboardProps {
    clientId: string;
    initialMeasurements: any;
    userName: string;
}

export default function ClientStudioDashboard({ clientId, initialMeasurements, userName }: ClientStudioDashboardProps) {
    const [activeTab, setActiveTab] = useState<'lookbooks' | 'wardrobe'>('lookbooks');

    return (
        <div className="min-h-screen bg-ac-sand/30 pb-20">
            {/* Header */}
            <header className="bg-white/60 backdrop-blur-md border-b border-ac-taupe/5 sticky top-20 z-40">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl text-ac-taupe">Personal Studio</h1>
                        <p className="text-[10px] uppercase tracking-widest text-ac-taupe/40 font-bold">
                            Welcome, {userName}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-ac-taupe/5 p-1 rounded-sm">
                        <button
                            onClick={() => setActiveTab('lookbooks')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'lookbooks' ? 'bg-white text-ac-taupe shadow-sm' : 'text-ac-taupe/40 hover:text-ac-taupe'}`}
                        >
                            <BookOpen size={14} />
                            Lookbooks
                        </button>
                        <button
                            onClick={() => setActiveTab('wardrobe')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'wardrobe' ? 'bg-white text-ac-taupe shadow-sm' : 'text-ac-taupe/40 hover:text-ac-taupe'}`}
                        >
                            <Shirt size={14} />
                            Wardrobe
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'lookbooks' ? (
                                <motion.div
                                    key="lookbooks"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <DigitalLookbook clientId={clientId} isClientView={true} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="wardrobe"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <VirtualWardrobe clientId={clientId} isClientView={true} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Side Panel (Contextual or Persistent) */}
                    <div className="lg:col-span-4 order-1 lg:order-2 space-y-8">
                        {/* Tailor Card is always visible as a reference */}
                        <div className="h-fit">
                            <TailorCardUser
                                userId={clientId}
                                initialMeasurements={initialMeasurements}
                                isActiveClient={true} // Always true here since route is protected
                            />
                        </div>

                        {/* Stylist Contact / Status (Placeholder for now) */}
                        <div className="bg-ac-taupe text-white p-6 rounded-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles size={20} className="text-ac-gold" />
                                <h3 className="font-serif text-xl">Stylist Status</h3>
                            </div>
                            <p className="text-xs leading-relaxed opacity-80 mb-4">
                                Your stylist is currently curating new items for your review. Check back soon for updates.
                            </p>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                Last Active: Today
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
