import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Landing-only avatar: the real Avatar primitive plus the separator border and
 * inset ring that keep overlapping stacks legible, and an `active` state the
 * propagation demo uses to light up affected travelers.
 */
export function MockAvatar({
    label,
    size = 'sm',
    active = false,
}: {
    label: string;
    size?: 'sm' | 'md';
    active?: boolean;
}) {
    return (
        <Avatar
            className={cn(
                size === 'md' ? 'size-7' : 'size-6',
                'border-background border-2 transition-all duration-500',
                active
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]',
            )}
        >
            <AvatarFallback className="bg-transparent text-[10px] font-medium text-inherit">
                {label}
            </AvatarFallback>
        </Avatar>
    );
}
