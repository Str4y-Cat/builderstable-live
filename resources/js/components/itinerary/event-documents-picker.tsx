import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Document } from '@/types/trip';

export function EventDocumentsPicker({
    documents,
    value,
    onChange,
    label = 'Documents',
    hint = 'Link trip documents to this event.',
}: {
    documents: Document[];
    value: number[];
    onChange: (value: number[]) => void;
    label?: string;
    hint?: string;
}) {
    const sortedDocuments = [...documents].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned),
    );

    function toggle(id: number, checked: boolean) {
        if (checked) {
            if (!value.includes(id)) {
                onChange([...value, id]);
            }
        } else {
            onChange(value.filter((item) => item !== id));
        }
    }

    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {documents.length === 0 ? (
                <div className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                    No trip documents yet. Add some in the Documents panel.
                </div>
            ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                    {sortedDocuments.map((doc) => (
                        <label
                            key={doc.id}
                            className="flex cursor-pointer items-start gap-2 text-sm"
                        >
                            <Checkbox
                                className="mt-0.5"
                                checked={value.includes(doc.id)}
                                onCheckedChange={(checked) =>
                                    toggle(doc.id, checked === true)
                                }
                            />
                            <span className="min-w-0">
                                <span className="font-medium">{doc.name}</span>
                                {doc.pinned ? (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        · pinned
                                    </span>
                                ) : null}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
