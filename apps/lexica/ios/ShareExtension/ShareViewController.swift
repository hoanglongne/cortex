import UIKit
import UniformTypeIdentifiers

/// "Share to Lexica" on iPhone. Takes a link or text from Safari, a news app or Facebook
/// and opens the main app at lexica://num-van?text=..., which Blend already handles
/// (app/lib/native.ts, NativeShell). Setup: docs/LEXICA_NATIVE_BUILD.md (Share Extension).
final class ShareViewController: UIViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        Task { await handoff() }
    }

    private func handoff() async {
        let text = await sharedText() ?? ""
        var parts = URLComponents()
        parts.scheme = "lexica"
        parts.host = "num-van"
        if !text.isEmpty { parts.queryItems = [URLQueryItem(name: "text", value: text)] }
        if let url = parts.url { openInHostApp(url) }
        extensionContext?.completeRequest(returningItems: nil)
    }

    /// The first link, else the first plain text, in what was shared.
    private func sharedText() async -> String? {
        let items = (extensionContext?.inputItems as? [NSExtensionItem]) ?? []
        for provider in items.flatMap({ $0.attachments ?? [] }) {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier),
               let item = try? await provider.loadItem(forTypeIdentifier: UTType.url.identifier),
               let url = item as? URL {
                return url.absoluteString
            }
        }
        for provider in items.flatMap({ $0.attachments ?? [] }) {
            if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier),
               let item = try? await provider.loadItem(forTypeIdentifier: UTType.plainText.identifier),
               let text = item as? String {
                return text
            }
        }
        return nil
    }

    /// An extension cannot call UIApplication.shared; walking the responder chain to the
    /// application object is the usual way to open the containing app.
    private func openInHostApp(_ url: URL) {
        var responder: UIResponder? = self
        while let r = responder {
            if let app = r as? UIApplication {
                app.open(url, options: [:], completionHandler: nil)
                return
            }
            responder = r.next
        }
    }
}
