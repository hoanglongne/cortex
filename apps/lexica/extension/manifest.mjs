// The extension manifest per browser. Chrome asks for sites one at a time (optional_host_permissions);
// Safari has its own per-site switch in Settings, and Apple's guide says to declare hosts in
// host_permissions, so the Safari build declares them there (docs/LEXICA_NATIVE_BUILD.md, N3).
export function manifestFor(base, target) {
    if (target !== 'safari') return base;
    const m = structuredClone(base);
    const hosts = new Set([...(m.host_permissions ?? []), ...(m.optional_host_permissions ?? [])]);
    m.host_permissions = [...hosts];
    delete m.optional_host_permissions;
    return m;
}
