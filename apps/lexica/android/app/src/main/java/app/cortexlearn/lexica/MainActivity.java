package app.cortexlearn.lexica;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    /**
     * "Share to Lexica" (ACTION_SEND, text/plain) arrives as a deep link,
     * lexica://num-van?text=..., which the web side already opens in Blend
     * (app/lib/native.ts, NativeShell). Capacitor delivers a VIEW link both on a
     * cold start (App.getLaunchUrl) and while running (appUrlOpen).
     */
    static Intent shareAsLink(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return intent;
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null || text.trim().isEmpty()) return intent;
        Uri link = new Uri.Builder().scheme("lexica").authority("num-van").appendQueryParameter("text", text).build();
        Intent view = new Intent(Intent.ACTION_VIEW, link);
        view.setPackage(intent.getComponent() != null ? intent.getComponent().getPackageName() : null);
        return view;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        setIntent(shareAsLink(getIntent()));
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(shareAsLink(intent));
    }
}
