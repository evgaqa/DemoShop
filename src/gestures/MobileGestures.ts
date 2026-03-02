export class MobileGestures {
    /**
     * Pinch-to-zoom via JavaScript — dispatches two-finger touch events directly on the element.
     * scale > 1 = zoom in (fingers spread apart), scale < 1 = zoom out (fingers pinch together).
     * More reliable for React apps than the W3C Actions API approach.
     */
    static async pinchToZoomJS(element: WebdriverIO.Element, scale: number = 2): Promise<void> {
        const rect = await browser.execute((el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height };
        }, element as any) as { top: number; left: number; width: number; height: number };

        const cx = Math.round(rect.left + rect.width  / 2);
        const cy = Math.round(rect.top  + rect.height / 2);
        // Finger separation in px: start close together (10) then spread (80) for zoom-in,
        // start spread (80) then pinch together (10) for zoom-out.
        const startDist = scale > 1 ? 10 : 80;
        const endDist   = scale > 1 ? 80 : 10;
        const steps     = 6; // interpolation steps — 6 gives smooth enough motion without excess events

        const fire = (type: string, dist: number) =>
            browser.execute((type: string, cx: number, cy: number, dist: number) => {
                const target = document.elementFromPoint(cx, cy) as HTMLElement;
                if (!target) return;
                const t1 = new Touch({ identifier: 1, target, clientX: cx, clientY: cy - dist, screenX: cx, screenY: cy - dist, pageX: cx, pageY: cy - dist });
                const t2 = new Touch({ identifier: 2, target, clientX: cx, clientY: cy + dist, screenX: cx, screenY: cy + dist, pageX: cx, pageY: cy + dist });
                const active = type === 'touchend' ? [] : [t1, t2];
                target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: active, targetTouches: active, changedTouches: [t1, t2] }));
            }, type, cx, cy, dist);

        await fire('touchstart', startDist);
        for (let i = 1; i <= steps; i++) {
            await fire('touchmove', Math.round(startDist + (endDist - startDist) * i / steps));
            await browser.pause(30); // eslint-disable-line wdio/no-pause -- deliberate gesture interpolation delay, not a test wait
        }
        await fire('touchend', endDist);
    }

    /**
     * Swipe left via JavaScript — dispatches touch and pointer events directly on the element.
     * More reliable for React apps than the W3C Actions API approach.
     */
    static async swipeLeftJS(element: WebdriverIO.Element): Promise<void> {
        const rect = await browser.execute((el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height };
        }, element as any) as { top: number; left: number; width: number; height: number };

        // Start at 85% of element width (near right edge), end at 10% (near left edge).
        // This keeps the touch points inside the element bounds to avoid missed hit-tests.
        const startX = Math.round(rect.left + rect.width * 0.85);
        const endX   = Math.round(rect.left + rect.width * 0.1);
        const y      = Math.round(rect.top  + rect.height / 2);
        const steps  = 8; // more steps than pinch because swipe covers more distance

        const fire = (type: string, x: number) =>
            browser.execute((type: string, x: number, y: number, startX: number) => {
                const target = document.elementFromPoint(startX, y) as HTMLElement;
                if (!target) return;
                const t = new Touch({ identifier: 1, target, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x, pageY: y });
                const active = type === 'touchend' ? [] : [t];
                target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: active, targetTouches: active, changedTouches: [t] }));
            }, type, x, y, startX);

        await fire('touchstart', startX);
        for (let i = 1; i <= steps; i++) {
            await fire('touchmove', Math.round(startX + (endX - startX) * i / steps));
            await browser.pause(30); // eslint-disable-line wdio/no-pause -- deliberate gesture interpolation delay, not a test wait
        }
        await fire('touchend', endX);
    }

    /**
     * Swipe down via JavaScript — dispatches touch events directly on the element.
     * Avoids W3C Actions "out of bounds" errors for tall/off-screen containers.
     */
    static async swipeDownJS(element: WebdriverIO.Element): Promise<void> {
        const rect = await browser.execute((el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height, viewportHeight: window.innerHeight };
        }, element as any) as { top: number; left: number; width: number; height: number; viewportHeight: number };

        const x      = Math.round(rect.left + rect.width / 2);
        const startY = Math.round(rect.top + 20);
        const endY   = Math.round(Math.min(startY + 400, rect.viewportHeight - 20));
        const steps  = 8;

        const fire = (type: string, y: number) =>
            browser.execute((type: string, x: number, y: number, refX: number, refY: number) => {
                const target = document.elementFromPoint(refX, refY) as HTMLElement;
                if (!target) return;
                const t = new Touch({ identifier: 1, target, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x, pageY: y });
                const active = type === 'touchend' ? [] : [t];
                target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: active, targetTouches: active, changedTouches: [t] }));
            }, type, x, y, x, startY);

        await fire('touchstart', startY);
        for (let i = 1; i <= steps; i++) {
            await fire('touchmove', Math.round(startY + (endY - startY) * i / steps));
            await browser.pause(30); // eslint-disable-line wdio/no-pause -- deliberate gesture interpolation delay, not a test wait
        }
        await fire('touchend', endY);
    }

    /**
     * Swipe up via JavaScript — dispatches touch events directly on the element.
     * Simulates scrolling down through content (finger moves upward on screen).
     */
    static async swipeUpJS(element: WebdriverIO.Element): Promise<void> {
        const rect = await browser.execute((el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height, viewportHeight: window.innerHeight };
        }, element as any) as { top: number; left: number; width: number; height: number; viewportHeight: number };

        const x      = Math.round(rect.left + rect.width / 2);
        // Start near the bottom of the viewport, move 400px upward — mirrors swipeDownJS in reverse.
        const startY = Math.round(Math.min(rect.viewportHeight - 20, rect.top + 300));
        const endY   = Math.round(Math.max(startY - 400, 20));
        const steps  = 8;

        const fire = (type: string, y: number) =>
            browser.execute((type: string, x: number, y: number, refX: number, refY: number) => {
                const target = document.elementFromPoint(refX, refY) as HTMLElement;
                if (!target) return;
                const t = new Touch({ identifier: 1, target, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x, pageY: y });
                const active = type === 'touchend' ? [] : [t];
                target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: active, targetTouches: active, changedTouches: [t] }));
            }, type, x, y, x, startY);

        await fire('touchstart', startY);
        for (let i = 1; i <= steps; i++) {
            await fire('touchmove', Math.round(startY + (endY - startY) * i / steps));
            await browser.pause(30); // eslint-disable-line wdio/no-pause -- deliberate gesture interpolation delay, not a test wait
        }
        await fire('touchend', endY);
    }

    /**
     * Long press via JavaScript — dispatches pointerdown directly on the element,
     * waits for the duration, then dispatches pointerup.
     * More reliable for React apps than the W3C Actions API approach because events
     * are fired synchronously into the app's event listeners without going through
     * the browser's native gesture pipeline.
     */
    static async longPressJS(element: WebdriverIO.Element, duration: number = 1500): Promise<void> {
        await browser.execute((el: HTMLElement) => {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, isPrimary: true, button: 0 }));
            el.dispatchEvent(new MouseEvent('mousedown',   { bubbles: true, cancelable: true, button: 0 }));
        }, element as any);

        await browser.pause(duration); // eslint-disable-line wdio/no-pause -- deliberate long-press hold duration, not a test wait

        await browser.execute((el: HTMLElement) => {
            el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, isPrimary: true, button: 0 }));
            el.dispatchEvent(new MouseEvent('mouseup',     { bubbles: true, cancelable: true, button: 0 }));
        }, element as any);
    }
}
