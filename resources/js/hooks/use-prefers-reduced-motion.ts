import { useSyncExternalStore } from 'react';

const mql =
    typeof window === 'undefined'
        ? undefined
        : window.matchMedia('(prefers-reduced-motion: reduce)');

function mediaQueryListener(callback: (event: MediaQueryListEvent) => void) {
    if (!mql) {
        return () => {};
    }

    mql.addEventListener('change', callback);

    return () => {
        mql.removeEventListener('change', callback);
    };
}

function prefersReduce(): boolean {
    return mql?.matches ?? false;
}

function getServerSnapshot(): boolean {
    return false;
}

/**
 * True when the viewer has asked the OS to minimise motion. Callers should
 * render the settled end state rather than animating toward it.
 */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        mediaQueryListener,
        prefersReduce,
        getServerSnapshot,
    );
}
