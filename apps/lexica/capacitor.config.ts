import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The packaged app (docs/LEXICA_NATIVE_APP_PLAN.md, way B): the static export in `out/`
 * (node scripts/build-native.mjs) is bundled into the app. The app id is permanent once
 * a store build is published, so confirm it before the first upload.
 */
const config: CapacitorConfig = {
    appId: 'app.cortexlearn.lexica',
    appName: 'Lexica',
    webDir: 'out',
    ios: { contentInset: 'always' },
    plugins: {
        // The splash hides itself from NativeShell once the page has drawn.
        SplashScreen: { launchAutoHide: false, backgroundColor: '#101012' },
    },
};

export default config;
