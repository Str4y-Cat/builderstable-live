import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels';
import { store } from '@/routes/trips';
import {
    TRIP_BADGES,
    TRIP_DESCRIPTION_MAX,
    TRIP_TAGS,
    type TripBadge,
    type TripTag,
} from '@/types/trip';

export function NewTripPanel({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [badge, setBadge] = useState<TripBadge>('planning');
    const [tags, setTags] = useState<TripTag[]>([]);
    const [autoNotifyOnAssign, setAutoNotifyOnAssign] = useState(true);

    const remainingChars = TRIP_DESCRIPTION_MAX - description.length;
    const canSubmit = name.trim().length > 0 && description.length <= TRIP_DESCRIPTION_MAX;

    useEffect(() => {
        if (open) {
            setName('');
            setDescription('');
            setBadge('planning');
            setTags([]);
            setAutoNotifyOnAssign(true);
        }
    }, [open]);

    function toggleTag(tag: TripTag, checked: boolean) {
        setTags((current) =>
            checked ? [...current, tag] : current.filter((item) => item !== tag),
        );
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!name.trim()) {
            toast.error('Name is required');

            return;
        }

        if (description.length > TRIP_DESCRIPTION_MAX) {
            toast.error(
                `Description must be ${TRIP_DESCRIPTION_MAX} characters or fewer`,
            );

            return;
        }

        router.post(store.url(), {
            name: name.trim(),
            description: description.trim(),
            badge,
            tags,
            auto_notify_on_assign: autoNotifyOnAssign,
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b pr-12">
                    <SheetTitle>New trip</SheetTitle>
                    <SheetDescription>
                        Description-first create. Dates come from itinerary events later —
                        no destination or date fields here.
                    </SheetDescription>
                </SheetHeader>
                <form
                    className="flex flex-1 flex-col gap-0 overflow-hidden"
                    onSubmit={handleSubmit}
                >
                    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-trip-name">Name</Label>
                            <Input
                                id="new-trip-name"
                                required
                                placeholder="Milan → Paris shoot"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <Label htmlFor="new-trip-description">Description</Label>
                                <span
                                    className={`text-xs tabular-nums ${
                                        remainingChars < 0
                                            ? 'text-destructive'
                                            : remainingChars <= 40
                                              ? 'text-amber-700'
                                              : 'text-muted-foreground'
                                    }`}
                                >
                                    {description.length}/{TRIP_DESCRIPTION_MAX}
                                </span>
                            </div>
                            <Textarea
                                id="new-trip-description"
                                maxLength={TRIP_DESCRIPTION_MAX}
                                rows={4}
                                placeholder="Short trip brief for the board card…"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {remainingChars} characters remaining
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-trip-badge">Badge</Label>
                            <Select
                                value={badge}
                                onValueChange={(value) => setBadge(value as TripBadge)}
                            >
                                <SelectTrigger id="new-trip-badge" className="w-full">
                                    <SelectValue placeholder="Select badge" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRIP_BADGES.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {tripBadgeLabel[item]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <p className="text-xs text-muted-foreground">
                                Fixed set — pick any that apply.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {TRIP_TAGS.map((tag) => (
                                    <label
                                        key={tag}
                                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                                            tags.includes(tag)
                                                ? 'border-foreground bg-foreground text-background'
                                                : 'bg-background'
                                        }`}
                                    >
                                        <Checkbox
                                            className="sr-only"
                                            checked={tags.includes(tag)}
                                            onCheckedChange={(checked) =>
                                                toggleTag(tag, checked === true)
                                            }
                                        />
                                        {tripTagLabel[tag]}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <label className="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                            <Checkbox
                                className="mt-0.5"
                                checked={autoNotifyOnAssign}
                                onCheckedChange={(checked) =>
                                    setAutoNotifyOnAssign(checked === true)
                                }
                            />
                            <span>
                                <span className="font-medium">Auto-notify on first assign</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Simulated email + Telegram when someone is newly assigned.
                                </span>
                            </span>
                        </label>
                    </div>
                    <SheetFooter className="border-t sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" disabled={!canSubmit}>
                            Create trip
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
