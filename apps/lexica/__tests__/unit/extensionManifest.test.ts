import { describe, expect, it } from 'vitest';
import base from '../../extension/src/manifest.json';
// @ts-expect-error plain ES module without types
import { manifestFor } from '../../extension/manifest.mjs';

describe('extension manifest per browser', () => {
    it('keeps the Chrome manifest as it is', () => {
        expect(manifestFor(base, 'chrome')).toEqual(base);
    });
    it('Safari declares the sites in host_permissions and has no optional ones', () => {
        const m = manifestFor(base, 'safari');
        expect(m.optional_host_permissions).toBeUndefined();
        expect(m.host_permissions).toEqual(expect.arrayContaining(['http://*/*', 'https://*/*', ...(base.host_permissions ?? [])]));
        expect(base.optional_host_permissions).toBeDefined(); // the source is not changed
        expect(m.permissions).toEqual(base.permissions);
    });
});
