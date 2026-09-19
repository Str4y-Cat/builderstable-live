import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Traveler } from '@/types/trip';

export function TravelerAssignPicker({
    travelers,
    value,
    onChange,
    label = 'Assign travelers',
    hint = 'Search for suggested names, then select. Leave unchecked for all travelers.',
    searchPlaceholder = 'Search crew by name, role, or Tel.…',
}: {
    travelers: Traveler[];
    value: number[];
    onChange: (value: number[]) => void;
    label?: string;
    hint?: string;
    searchPlaceholder?: string;
}) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setQuery('');
        setShowSuggestions(false);
    }, [travelers]);

    function matchesQuery(traveler: Traveler, q: string): boolean {
        return [traveler.name, traveler.roleOnProduction, traveler.email, traveler.phone ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q);
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return travelers;
        }

        return travelers.filter((traveler) => matchesQuery(traveler, q));
    }, [query, travelers]);

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return [];
        }

        return travelers
            .filter((traveler) => matchesQuery(traveler, q))
            .map((traveler) => {
                const name = traveler.name.toLowerCase();
                const score = name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2;

                return { traveler, score };
            })
            .sort((a, b) => a.score - b.score || a.traveler.name.localeCompare(b.traveler.name))
            .map((item) => item.traveler)
            .slice(0, 8);
    }, [query, travelers]);

    function toggle(id: number, checked: boolean) {
        onChange(
            checked
                ? value.includes(id)
                    ? value
                    : [...value, id]
                : value.filter((item) => item !== id),
        );
    }

    function pickSuggestion(traveler: Traveler) {
        toggle(traveler.id, true);
        setQuery(traveler.name);
        setShowSuggestions(false);
    }

    function nameFor(id: number): string {
        return travelers.find((traveler) => traveler.id === id)?.name ?? String(id);
    }

    return (
        <div className="space-y-2" data-traveler-assign-root="true">
            {label ? <Label>{label}</Label> : null}
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {travelers.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    No travelers on this trip yet.
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 z-[1] h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            className="pl-8"
                            placeholder={searchPlaceholder}
                            autoComplete="off"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {showSuggestions && query.trim() && suggestions.length ? (
                            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                                {suggestions.map((traveler) => (
                                    <li key={traveler.id}>
                                        <button
                                            type="button"
                                            className="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                pickSuggestion(traveler);
                                            }}
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="font-medium">{traveler.name}</span>
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    · {traveler.roleOnProduction}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    {value.length ? (
                        <div className="flex flex-wrap gap-1">
                            {value.map((id) => (
                                <Badge key={id} variant="secondary" className="font-normal">
                                    {nameFor(id)}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">All travelers (default)</p>
                    )}
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                        {filtered.map((traveler) => (
                            <label
                                key={traveler.id}
                                className="flex cursor-pointer items-start gap-2 text-sm"
                            >
                                <Checkbox
                                    className="mt-0.5"
                                    checked={value.includes(traveler.id)}
                                    onCheckedChange={(checked) =>
                                        toggle(traveler.id, checked === true)
                                    }
                                />
                                <span className="min-w-0">
                                    <span className="font-medium">{traveler.name}</span>
                                    <span className="text-muted-foreground">
                                        {' '}
                                        · {traveler.roleOnProduction}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
