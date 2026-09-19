import type { ReactNode } from 'react';

export function BrowserFrame({
    url,
    children,
}: {
    /** Optional faux address-bar text. */
    url?: string;
    children: ReactNode;
}) {
    return (
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]">
            {/* Faux browser chrome — hairline, not skeuomorphic */}
            <div className="border-border bg-muted/40 flex items-center gap-2 border-b px-3 py-2.5">
                <div className="flex gap-1.5">
                    <span className="bg-border size-2.5 rounded-full" />
                    <span className="bg-border size-2.5 rounded-full" />
                    <span className="bg-border size-2.5 rounded-full" />
                </div>
                {url ? (
                    <div className="bg-background text-muted-foreground mx-auto hidden max-w-[60%] truncate rounded-md px-3 py-0.5 text-xs sm:block">
                        {url}
                    </div>
                ) : (
                    <div className="mx-auto" />
                )}
                <div className="w-[52px] shrink-0" aria-hidden="true" />
            </div>

            <div className="bg-background">{children}</div>
        </div>
    );
}
