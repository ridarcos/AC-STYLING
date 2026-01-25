
"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/app/actions/admin/manage-clients";
import { User, Search, Eye } from "lucide-react";

interface ClientListProps {
    onSelectClient: (client: any) => void;
}

export default function ClientList({ onSelectClient }: ClientListProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getClients().then(res => {
            if (res.success) setClients(res.clients || []);
            setLoading(false);
        });
    }, []);

    const filteredClients = clients.filter(c => {
        if (!search) return true;
        const nameMatch = c.full_name?.toLowerCase().includes(search.toLowerCase());
        const usernameMatch = c.username?.toLowerCase().includes(search.toLowerCase());
        return nameMatch || usernameMatch;
    });

    if (loading) return <div className="p-8 text-center text-ac-taupe/40">Loading clients...</div>;

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-ac-taupe/40" size={18} />
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/40 border border-ac-taupe/10 rounded-sm text-ac-taupe focus:outline-none focus:border-ac-gold"
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-white/60 p-4 rounded-sm border border-white/50 flex items-center justify-between group hover:border-ac-gold/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-ac-taupe/10 rounded-full flex items-center justify-center text-ac-taupe">
                                {client.avatar_url ? (
                                    <img src={client.avatar_url} alt={client.full_name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-serif text-lg text-ac-taupe leading-tight">
                                    {client.full_name || client.email || 'Unnamed Client'}
                                </h4>
                                <p className="text-xs text-ac-taupe/40 uppercase tracking-widest">
                                    {client.email || `User ID: ${client.id.slice(0, 8)}...`}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectClient(client)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-ac-taupe/10 rounded-full text-xs font-bold uppercase tracking-widest text-ac-taupe hover:bg-ac-taupe hover:text-white transition-colors"
                        >
                            <Eye size={14} />
                            View Dossier
                        </button>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <p className="text-center text-ac-taupe/40 py-8">No clients found.</p>
                )}
            </div>
        </div>
    );
}
