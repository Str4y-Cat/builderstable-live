import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { share } from '@/routes/trips';

export function ShareLinkButton({ shareCode }: { shareCode: string }) {
    async function copyLink() {
        const path = share.url(shareCode);
        const url =
            typeof window !== 'undefined' && window.location?.origin
                ? `${window.location.origin}${path}`
                : path;

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied');
        } catch {
            toast.error('Could not copy link');
        }
    }

    return (
        <Button variant="outline" size="sm" type="button" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5" />
            Copy link
        </Button>
    );
}
