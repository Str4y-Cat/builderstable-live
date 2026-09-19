import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * The `size-5` avatar the real itinerary row uses
 * (`itinerary-item-card.tsx`), plus an `active` state the propagation demo
 * lights up as a change propagates to the travelers attached to an item.
 */
export function MockAvatar({
    label,
    active = false,
}: {
    label: string;
    active?: boolean;
}) {
    return (
        <Avatar className="size-5">
            <AvatarFallback
                className={cn(
                    'text-[10px] transition-colors duration-500',
                    active && 'bg-foreground text-background',
                )}
            >
                {label}
            </AvatarFallback>
        </Avatar>
    );
}
