import { getUserPurchases } from '@/app/actions/commerce';
import Link from 'next/link';
import { Lock, Play, ArrowRight } from 'lucide-react';


// We need a Client Component wrapper for the Motion parts if we want to keep this Server Side for fetching
// OR we make this a Server Component and put the Motion logic in a client child.
// Let's keep it simple: Client Component for interactivity? 
// The prompt implies we want to fetch purchases. Server Component is best for that.
// So we'll fetch data here, then pass to a client grid component OR just render static HTML with client interactions?
// Actually, using "use client" at top means it's a Client Component. `getUserPurchases` won't run directly if it uses headers/cookies unless called via Server Action or API. 
// BUT: 'getUserPurchases' is marked 'use server', so we can call it from a Server Component.
// So let's delete "use client" and make this a Server Component.

export default async function GalleryPage() {
    const purchases = await getUserPurchases();

    // Map of product IDs to real content
    const MASTERCLASSES = [
        { id: 'style-audit', title: "The Wardrobe Audit", subtitle: "Foundation No. 1", videoId: "76979871" },
        { id: 'foundations', title: "Color Theory & You", subtitle: "Foundation No. 2", videoId: "76979871" },
        { id: 'silhouette', title: "Silhouettes & Shape", subtitle: "Foundation No. 3", videoId: "76979871" },
        { id: 'editing', title: "The Art of Editing", subtitle: "Advanced Technique", videoId: "76979871" },
        { id: 'sourcing', title: "Sourcing Vintage", subtitle: "Advanced Technique", videoId: "76979871" },
        { id: 'transitions', title: "Seasonal Transitions", subtitle: "Mastery Series", videoId: "76979871" }
    ];

    const isPurchased = (id: string) => purchases.includes(id);

    return (
        <div className="min-h-screen text-[#3D3630] -mt-24 pt-24"> {/* -mt-24 to counteract layout pt-24 if needed, or just let it stack */}
            {/* Custom Header for Gallery Mode */}
            <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-[#E6DED6]/80 backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <span className="font-serif text-xl tracking-tighter">AC STYLING</span>
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                    <Link href="/vault" className="text-[10px] uppercase tracking-widest text-[#3D3630]/60 hover:text-[#3D3630]">Dashboard</Link>
                    <div className="bg-[#3D3630] text-[#E6DED6] px-3 py-1 text-[10px] font-bold uppercase rounded-full">
                        Vault Access
                    </div>
                </div>
            </div>

            <section className="pt-12 pb-20 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 mb-24">
                    {/* Left: Text Content */}
                    <div className="lg:w-1/2 flex flex-col justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-4">The Methodology</span>
                        <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-[0.9] text-[#3D3630]">
                            Style is a Language. <br /><span className="italic opacity-80">Learn to Speak It.</span>
                        </h1>
                        <div className="text-[#3D3630]/70 text-lg font-light leading-relaxed mb-8 max-w-md">
                            Join Alejandra Carrillo in this exclusive masterclass series. Move beyond trends and discover the timeless architectural principles of personal style.
                        </div>
                        <div className="flex gap-4">
                            <Link
                                href="/vault"
                                className="inline-flex items-center gap-2 bg-[#3D3630] text-[#E6DED6] px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-[#3D3630]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <ArrowRight size={14} />
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Right: Vimeo Player (Intro - Free) */}
                    <div className="lg:w-1/2 relative">
                        <div className="aspect-video w-full bg-black/5 overflow-hidden rounded-sm border border-[#3D3630]/10 relative shadow-2xl">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#C5A059]/20 to-transparent opacity-50 blur-xl"></div>
                            <iframe
                                src="https://player.vimeo.com/video/76979871?h=8272103f6e&badge=0&autopause=0&player_id=0&app_id=58479"
                                className="absolute top-0 left-0 w-full h-full relative z-10"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                title="Alejandra Carrillo Intro"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MASTERCLASSES.map((item) => {
                        const unlocked = isPurchased(item.id);
                        return (
                            <div key={item.id} className="group relative aspect-[3/4] overflow-hidden bg-[#3D3630]/5 border border-[#3D3630]/5 flex flex-col">
                                {/* Thumbnail Area */}
                                {/* Thumbnail Area */}
                                <div className="flex-1 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-neutral-300"></div> {/* Placeholder Image */}

                                    {/* State Overlay */}
                                    {/* Using absolute positioning and explicit z-index to avoid pointer-event conflicts */}
                                    <div className={`
                                        absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 z-10
                                        ${unlocked ? 'bg-black/20 hover:bg-black/10' : 'backdrop-blur-md bg-[#E6DED6]/20 hover:backdrop-blur-[12px]'}
                                     `}>
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110
                                            ${unlocked ? 'bg-[#C5A059] text-white' : 'bg-[#E6DED6]/90 text-[#3D3630]'}
                                        `}>
                                            {unlocked ? <Play fill="currentColor" size={16} /> : <Lock size={16} />}
                                        </div>

                                        <span className="text-[10px] uppercase tracking-widest text-white/90 drop-shadow-md font-bold mb-2">{item.subtitle}</span>
                                        <h3 className="font-serif text-2xl text-white drop-shadow-md">{item.title}</h3>

                                        {!unlocked && (
                                            <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                                <span className="bg-[#3D3630] text-[#E6DED6] px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm inline-flex items-center gap-2">
                                                    Purchase Access <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Link Logic */}
                                {unlocked ? (
                                    <Link href={`/vault/watch/${item.id}`} className="absolute inset-0 z-20 block" aria-label={`Watch ${item.title}`} />
                                ) : (
                                    <Link href={`/vault/checkout/${item.id}`} className="absolute inset-0 z-20 block" aria-label={`Purchase ${item.title}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
