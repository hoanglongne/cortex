/**
 * Web push in Lexica (docs/LEXICA_PUSH_SPEC.md): the device agrees, and its
 * subscription is saved on the account (supabase/migration_push.sql). The
 * Cortex API sends; worker/index.js shows it. iPhone only supports it for an
 * app added to the home screen (iOS 16.4 or later).
 */
import { getSupabaseClient } from './supabase';

export const VAPID_PUBLIC: string | null = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;

export type PushSupport = 'ok' | 'ios-install' | 'unsupported';

export function pushSupport(): PushSupport {
    if (typeof window === 'undefined' || !VAPID_PUBLIC) return 'unsupported';
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) return 'ok';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return ios ? 'ios-install' : 'unsupported';
}

/** The VAPID key in the form pushManager.subscribe wants. */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

/** Is this device already subscribed? */
export async function pushEnabled(): Promise<boolean> {
    if (pushSupport() !== 'ok' || Notification.permission !== 'granted') return false;
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(await reg?.pushManager.getSubscription());
    } catch {
        return false;
    }
}

/** Asks permission (from a tap), subscribes and saves it on the account. */
export async function enablePush(): Promise<'ok' | 'denied' | 'unsupported' | 'error'> {
    if (pushSupport() !== 'ok' || !VAPID_PUBLIC) return 'unsupported';
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) }));
        const json = sub.toJSON();
        const supabase = getSupabaseClient();
        if (!supabase || !json.endpoint || !json.keys?.p256dh || !json.keys.auth) return 'error';
        const { error } = await supabase.rpc('push_subscribe', { p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth, p_ua: navigator.userAgent });
        return error ? 'error' : 'ok';
    } catch {
        return 'error';
    }
}

export async function disablePush(): Promise<void> {
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (!sub) return;
        await getSupabaseClient()?.rpc('push_unsubscribe', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
    } catch {
        // Nothing to undo.
    }
}
