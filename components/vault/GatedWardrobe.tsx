'use client';

import { useState } from 'react';
import { Lock, Plus, Camera, Loader2, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface GatedWardrobeProps {
    isActiveClient: boolean;
    userId: string;
    initialItems?: any[];
}

export default function GatedWardrobe({ isActiveClient, userId, initialItems = [] }: GatedWardrobeProps) {
    const [items, setItems] = useState<any[]>(initialItems);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [clientNote, setClientNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    // -- LOCKED STATE --
    if (!isActiveClient) {
        return (
            <div className="relative h-full min-h-[500px] border border-ac-taupe/10 rounded-sm overflow-hidden group">
                {/* Background blurred representation of a wardrobe */}
                <div className="absolute inset-0 bg-[#E6DED6] opacity-50" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1fddd79c17?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-xl" />

                <div className="absolute inset-0 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="w-16 h-16 bg-[#3D3630] text-[#E6DED6] rounded-full flex items-center justify-center mb-6 shadow-2xl">
                        <Lock size={24} />
                    </div>
                    <h2 className="font-serif text-3xl text-[#3D3630] mb-2">The Digital Wardrobe</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#3D3630]/60 mb-8 max-w-xs">
                        Unlock your collaborative closet. Book a session to start your digital styling journey.
                    </p>
                    <Link
                        href="/vault/services"
                        className="bg-[#3D3630] text-[#E6DED6] px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-[#3D3630]/90 transition-all shadow-xl hover:shadow-2xl translate-y-0 hover:-translate-y-1"
                    >
                        Book a Service
                    </Link>
                </div>
            </div>
        );
    }

    // -- ACTIVE STATE --
    const handleUpload = async () => {
        if (!uploadFile) return toast.error("Please select a photo.");
        setIsSaving(true);
        try {
            const fileName = `${Date.now()}-${uploadFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('studio-wardrobe')
                .upload(`${userId}/${fileName}`, uploadFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('studio-wardrobe')
                .getPublicUrl(`${userId}/${fileName}`);

            const { data: newItem, error: dbError } = await supabase.from('wardrobe_items').insert({
                user_id: userId,
                image_url: publicUrl,
                client_note: clientNote,
                status: 'Keep', // Default status
                category: 'Uncategorized'
            }).select().single();

            if (dbError) throw dbError;

            setItems([newItem, ...items]);
            toast.success("Item added to your wardrobe!");
            setIsUploading(false);
            setUploadFile(null);
            setClientNote("");
        } catch (err: any) {
            toast.error(err.message || "Failed to upload.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-ac-taupe/10 pb-4">
                <div>
                    <h2 className="font-serif text-3xl text-ac-taupe">Digital Wardrobe</h2>
                    <p className="text-[10px] uppercase tracking-widest text-ac-taupe/40 font-bold mt-1">
                        {items.length} Items • Use the Snapper to add more
                    </p>
                </div>
                <button
                    onClick={() => setIsUploading(true)}
                    className="bg-ac-gold text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-ac-taupe transition-colors flex items-center gap-2"
                >
                    <Camera size={14} />
                    Add Item
                </button>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="flex-1 border-2 border-dashed border-ac-taupe/10 rounded-sm flex flex-col items-center justify-center min-h-[300px] text-ac-taupe/40">
                    <p className="text-xs uppercase tracking-widest mb-4">Your wardrobe is empty.</p>
                    <button onClick={() => setIsUploading(true)} className="text-ac-gold hover:underline text-xs">Upload your first piece</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                    {items.map((item) => (
                        <div key={item.id} className="group relative aspect-[3/4] bg-white/40 rounded-sm overflow-hidden border border-white/50 hover:border-ac-gold/30 transition-all">
                            <img src={item.image_url} alt="Wardrobe item" className="w-full h-full object-cover" />

                            {/* Status Tag */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[8px] font-bold uppercase tracking-widest text-ac-taupe shadow-sm">
                                {item.status}
                            </div>

                            {/* Hover Details */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">{item.category || 'Uncategorized'}</p>
                                {item.client_note && (
                                    <p className="text-[10px] italic opacity-80 line-clamp-2">"{item.client_note}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal (Mobile Snapper) */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-ac-taupe/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white max-w-md w-full rounded-sm shadow-2xl overflow-hidden relative"
                        >
                            <button onClick={() => setIsUploading(false)} className="absolute top-4 right-4 z-50 text-ac-taupe/30 hover:text-ac-taupe"><Plus className="rotate-45" size={24} /></button>

                            <div className="p-6 bg-[#E6DED6]">
                                <h3 className="font-serif text-2xl text-ac-taupe">Mobile Snapper</h3>
                                <p className="text-[10px] uppercase tracking-widest text-ac-taupe/50">Quick Add to Wardrobe</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="aspect-square bg-ac-taupe/5 border-2 border-dashed border-ac-taupe/10 rounded-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-ac-gold/30 transition-colors">
                                    {uploadFile ? (
                                        <img src={URL.createObjectURL(uploadFile)} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="text-center">
                                            <Camera size={24} className="text-ac-taupe/20 mx-auto mb-2" />
                                            <span className="text-[9px] uppercase font-bold tracking-widest text-ac-taupe/40">Tap to Snap or Upload</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>

                                <div>
                                    <label className="text-[9px] uppercase font-bold tracking-widest text-ac-taupe/40 block mb-2">Notes for Alejandra</label>
                                    <textarea
                                        value={clientNote}
                                        onChange={(e) => setClientNote(e.target.value)}
                                        placeholder="Any specific questions about this item?"
                                        className="w-full bg-ac-taupe/5 border border-ac-taupe/10 rounded-sm p-3 text-sm focus:outline-none focus:border-ac-gold h-20 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!uploadFile || isSaving}
                                    className="w-full bg-ac-gold text-white py-4 rounded-sm font-bold uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-ac-taupe transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                    Add to Wardrobe
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
