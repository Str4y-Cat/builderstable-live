import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/trips/travelers';
import type { Trip } from '@/types/trip';

export function TravelerForm({
    open,
    onOpenChange,
    trip,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: Trip;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roleOnProduction, setRoleOnProduction] = useState('');

    useEffect(() => {
        if (open) {
            setName('');
            setEmail('');
            setPhone('');
            setRoleOnProduction('');
        }
    }, [open]);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !roleOnProduction.trim()) {
            toast.error('Name, email, and role are required');

            return;
        }

        router.post(
            store.url(trip.id),
            {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                role_on_production: roleOnProduction.trim(),
            },
            { onSuccess: () => onOpenChange(false) },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add traveler</DialogTitle>
                    <DialogDescription>
                        Add a crew member to this trip. A share link is generated
                        automatically.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="traveler-name">Name</Label>
                        <Input
                            id="traveler-name"
                            required
                            placeholder="Jordan Lee"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="traveler-email">Email</Label>
                        <Input
                            id="traveler-email"
                            type="email"
                            required
                            placeholder="jordan@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="traveler-phone">Phone / Telegram</Label>
                        <Input
                            id="traveler-phone"
                            placeholder="Optional"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="traveler-role">Role on production</Label>
                        <Input
                            id="traveler-role"
                            required
                            placeholder="e.g. DP, Talent, 1st AD"
                            value={roleOnProduction}
                            onChange={(event) => setRoleOnProduction(event.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Add traveler</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
