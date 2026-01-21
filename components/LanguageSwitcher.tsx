"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();

    return (
        <div className="flex gap-2 text-sm font-sans uppercase tracking-widest">
            <Link
                href={pathname}
                locale="en"
                className={`transition-colors duration-300 ${locale === "en" ? "text-ac-beige font-bold border-b border-ac-beige" : "text-white/70 hover:text-white"
                    }`}
            >
                EN
            </Link>
            <span className="text-white/50">|</span>
            <Link
                href={pathname}
                locale="es"
                className={`transition-colors duration-300 ${locale === "es" ? "text-ac-beige font-bold border-b border-ac-beige" : "text-white/70 hover:text-white"
                    }`}
            >
                ES
            </Link>
        </div>
    );
}
