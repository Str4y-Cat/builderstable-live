import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newId } from '@/lib/tripHelpers';
import type { EventTask } from '@/types/trip';

export function EventTasksEditor({
    value,
    onChange,
    label = 'Sub-tasks',
    hint = 'Optional checklist for this event.',
}: {
    value: EventTask[];
    onChange: (value: EventTask[]) => void;
    label?: string;
    hint?: string;
}) {
    const [draft, setDraft] = useState('');
    const doneCount = value.filter((task) => task.done).length;

    function addDraft() {
        const title = draft.trim();

        if (!title) {
            return;
        }

        onChange([...value, { id: newId('task'), title, done: false }]);
        setDraft('');
    }

    return (
        <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
                <Label>{label}</Label>
                {value.length ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {doneCount}/{value.length}
                    </span>
                ) : null}
            </div>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {value.length ? (
                <ul className="divide-y rounded-md border">
                    {value.map((task, index) => (
                        <li key={task.id} className="flex items-start gap-2 px-3 py-2">
                            <Checkbox
                                className="mt-0.5"
                                checked={task.done}
                                onCheckedChange={(checked) =>
                                    onChange(
                                        value.map((item, itemIndex) =>
                                            itemIndex === index
                                                ? { ...item, done: checked === true }
                                                : item,
                                        ),
                                    )
                                }
                            />
                            <Input
                                className="h-8 flex-1"
                                maxLength={120}
                                value={task.title}
                                onChange={(event) =>
                                    onChange(
                                        value.map((item, itemIndex) =>
                                            itemIndex === index
                                                ? { ...item, title: event.target.value }
                                                : item,
                                        ),
                                    )
                                }
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                    onChange(value.filter((_, itemIndex) => itemIndex !== index))
                                }
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                    No sub-tasks yet.
                </p>
            )}
            <div className="flex gap-2">
                <Input
                    className="flex-1"
                    maxLength={120}
                    placeholder="Add a sub-task…"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            addDraft();
                        }
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={!draft.trim()}
                    onClick={addDraft}
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
