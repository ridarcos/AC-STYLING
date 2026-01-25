"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createMasterclass, updateMasterclass } from "@/app/actions/admin/manage-masterclasses";
import { uploadFile } from "@/app/actions/admin/upload-file";
import { toast } from "sonner";

interface MasterclassFormProps {
    masterclass?: any;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function MasterclassForm({ masterclass, onSuccess, onCancel }: MasterclassFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: masterclass?.title || '',
        subtitle: masterclass?.subtitle || '',
        description: masterclass?.description || '',
        thumbnailUrl: masterclass?.thumbnail_url || '',
        orderIndex: masterclass?.order_index || 0,
    });

    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    useEffect(() => {
        setFormData({
            title: masterclass?.title || '',
            subtitle: masterclass?.subtitle || '',
            description: masterclass?.description || '',
            thumbnailUrl: masterclass?.thumbnail_url || '',
            orderIndex: masterclass?.order_index || 0,
        });
    }, [masterclass]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            setUploadingThumbnail(true);
            const fd = new FormData();
            fd.append('file', acceptedFiles[0]);
            const result = await uploadFile(fd);
            if (result.success) {
                setFormData({ ...formData, thumbnailUrl: result.url! });
                toast.success('Thumbnail uploaded');
            } else {
                toast.error(result.error || 'Upload failed');
            }
            setUploadingThumbnail(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('subtitle', formData.subtitle);
        fd.append('description', formData.description);
        fd.append('thumbnailUrl', formData.thumbnailUrl);
        fd.append('orderIndex', formData.orderIndex.toString());

        const result = masterclass
            ? await updateMasterclass(masterclass.id, fd)
            : await createMasterclass(fd);

        if (result.success) {
            toast.success(masterclass ? 'Masterclass updated' : 'Masterclass created');
            onSuccess();
            if (!masterclass) {
                setFormData({ title: '', subtitle: '', description: '', thumbnailUrl: '', orderIndex: 0 });
            }
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h3 className="font-serif text-2xl text-ac-taupe border-b border-ac-taupe/10 pb-3">
                {masterclass ? 'Edit Masterclass' : 'New Masterclass'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-ac-taupe/80 uppercase tracking-widest">
                        Cover Image
                    </label>
                    {formData.thumbnailUrl ? (
                        <div className="relative aspect-video rounded-sm overflow-hidden border border-ac-taupe/20">
                            <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors aspect-video flex flex-col items-center justify-center ${isDragActive
                                ? 'border-ac-gold bg-ac-gold/5'
                                : 'border-ac-taupe/20 hover:border-ac-gold/50 bg-white/20'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <ImageIcon size={32} className="mx-auto mb-3 text-ac-taupe/40" />
                            <p className="text-sm text-ac-taupe/60">
                                {uploadingThumbnail ? 'Uploading...' : 'Drop cover image here'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-ac-taupe/80 uppercase tracking-widest mb-2">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/40 border border-ac-taupe/10 rounded-sm p-3 text-ac-taupe focus:border-ac-gold focus:ring-1 focus:ring-ac-gold"
                            placeholder="e.g. Color Mastery"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ac-taupe/80 uppercase tracking-widest mb-2">Subtitle</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full bg-white/40 border border-ac-taupe/10 rounded-sm p-3 text-ac-taupe focus:border-ac-gold focus:ring-1 focus:ring-ac-gold"
                            placeholder="e.g. The definitive guide to palette"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ac-taupe/80 uppercase tracking-widest mb-2">Order Index</label>
                        <input
                            type="number"
                            value={formData.orderIndex}
                            onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white/40 border border-ac-taupe/10 rounded-sm p-3 text-ac-taupe focus:border-ac-gold focus:ring-1 focus:ring-ac-gold"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-ac-taupe/80 uppercase tracking-widest mb-2">Description</label>
                <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/40 border border-ac-taupe/10 rounded-sm p-3 text-ac-taupe focus:border-ac-gold focus:ring-1 focus:ring-ac-gold resize-none"
                    placeholder="What will students learn in this masterclass?"
                />
            </div>

            <div className="flex gap-4 justify-end border-t border-ac-taupe/10 pt-6">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-ac-taupe/20 rounded-sm text-ac-taupe hover:bg-white/20"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-ac-taupe text-white rounded-sm hover:bg-ac-taupe/90 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : masterclass ? 'Update Masterclass' : 'Create Masterclass'}
                </button>
            </div>
        </form>
    );
}
