
import { Link } from "@/i18n/routing";
import { ArrowLeft, PlayCircle, FolderOpen, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MasterclassPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Masterclass Details
    const { data: masterclass, error: mcError } = await supabase
        .from('masterclasses')
        .select('*')
        .eq('id', id)
        .single();

    if (mcError || !masterclass) {
        redirect('/vault/foundations');
    }

    // 2. Fetch Chapters in this Masterclass
    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('masterclass_id', id)
        .order('order_index', { ascending: true });

    // 3. User Progress Logic
    const completedChapters = new Set();
    if (user) {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('content_id')
            .eq('user_id', user.id);

        progress?.forEach(p => {
            if (p.content_id.startsWith('foundations/')) {
                const slug = p.content_id.split('/')[1];
                completedChapters.add(slug);
            }
        });
    }

    const totalChapters = chapters?.length || 0;
    const completedCount = chapters?.filter(c => completedChapters.has(c.slug)).length || 0;
    const progressPercent = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

    return (
        <section className="min-h-screen">
            {/* Nav */}
            <div className="mb-8 border-b border-ac-taupe/10 pb-6">
                <Link href="/vault/foundations" className="flex items-center gap-2 text-sm uppercase tracking-widest text-ac-taupe/60 hover:text-ac-olive transition-colors mb-6 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Collections
                </Link>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Thumbnail */}
                    <div className="w-full md:w-1/3 aspect-video rounded-sm overflow-hidden shadow-lg">
                        <img
                            src={masterclass.thumbnail_url || "https://images.unsplash.com/photo-1490481651871-ab52661227ed?q=80&w=2070&auto=format&fit=crop"}
                            alt={masterclass.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest uppercase bg-ac-gold/10 text-ac-gold rounded-sm">
                            Masterclass Collection
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl text-ac-taupe mb-4">
                            {masterclass.title}
                        </h1>
                        <p className="text-ac-taupe/80 text-lg leading-relaxed max-w-2xl mb-6">
                            {masterclass.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="max-w-md">
                            <div className="flex justify-between text-xs uppercase tracking-widest text-ac-taupe/60 mb-2">
                                <span>Progress</span>
                                <span>{completedCount} / {totalChapters} Lessons</span>
                            </div>
                            <div className="h-1 w-full bg-ac-taupe/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-ac-gold transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {chapters && chapters.map((chapter, index) => {
                    const isCompleted = completedChapters.has(chapter.slug);
                    return (
                        <Link href={`/vault/foundations/${chapter.slug}`} key={chapter.id} className="group block">
                            <div className="relative aspect-video overflow-hidden rounded-sm mb-3 bg-ac-sand/20">
                                <div className="absolute inset-0 bg-ac-taupe/10 group-hover:bg-transparent transition-colors z-10" />
                                {chapter.thumbnail_url ? (
                                    <img
                                        src={chapter.thumbnail_url}
                                        alt={chapter.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-ac-taupe/20">
                                        <FolderOpen size={32} />
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 z-30">
                                    {isCompleted ? (
                                        <div className="bg-ac-olive text-white p-1 rounded-full shadow-md">
                                            <Check size={14} />
                                        </div>
                                    ) : (
                                        <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-sm text-white/80 text-[10px] uppercase font-bold">
                                            {index + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/40">
                                        <PlayCircle size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-serif text-xl text-ac-taupe group-hover:text-ac-olive transition-colors">
                                {chapter.title}
                            </h3>
                            <p className="text-sm text-ac-taupe/60 line-clamp-1 mt-1">
                                {chapter.subtitle}
                            </p>
                        </Link>
                    );
                })}
            </div>

            {(!chapters || chapters.length === 0) && (
                <div className="text-center py-20 border-t border-ac-taupe/10 mt-12">
                    <p className="text-ac-taupe/40 italic">Coming soon.</p>
                </div>
            )}
        </section>
    );
}
