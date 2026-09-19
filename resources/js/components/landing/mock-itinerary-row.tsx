import { MockAvatar } from '@/components/landing/mock-avatar';
import { Badge } from '@/components/ui/badge';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import { cn } from '@/lib/utils';
import type { ItineraryItemType } from '@/types/trip';

export function MockItineraryRow({
    time,
    title,
    location,
    type,
    attendees = [],
    highlighted = false,
    updated = false,
}: {
    time: string;
    title: string;
    location: string;
    type: ItineraryItemType;
    attendees?: readonly string[];
    /** Row is the focus of the demo's current phase. */
    highlighted?: boolean;
    /** Show the "Updated" accent flag. */
    updated?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-xl border px-3 py-3 transition-all duration-500',
                highlighted
                    ? 'border-foreground/20 bg-muted/60'
                    : 'border-transparent',
            )}
        >
            <div className="w-12 shrink-0 pt-0.5">
                <span
                    className={cn(
                        'font-mono text-xs tabular-nums transition-colors duration-500',
                        highlighted
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground',
                    )}
                >
                    {time}
                </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className={itemTypeBadgeClass(type)}>
                        {itemTypeLabel(type)}
                    </Badge>
                    {updated && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-700">
                            <span className="size-1.5 rounded-full bg-orange-500" />
                            Updated
                        </span>
                    )}
                </div>
                <p className="truncate text-sm leading-snug font-medium">
                    {title}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                    {location}
                </p>
            </div>

            {attendees.length > 0 && (
                <div className="flex shrink-0 -space-x-1.5 pt-0.5">
                    {attendees.map((person) => (
                        <MockAvatar
                            key={person}
                            label={person}
                            active={highlighted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
