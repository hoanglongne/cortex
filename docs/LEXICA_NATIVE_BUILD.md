# Build app Lexica (Capacitor, cách B), hướng dẫn chạy trên máy bạn

Trạng thái: khung app đã có (N1 một phần). Chưa chạy thử trên thiết bị thật, nên các bước dưới là chỉ dẫn, chưa kiểm chứng.

## Đã có trong repo (`apps/lexica`)
- `capacitor.config.ts`: app id `app.cortexlearn.lexica` (**đổi trước lần nộp đầu tiên, sau đó không đổi được**), thư mục web `out`.
- `scripts/build-native.mjs`: build xuất tĩnh vào `out/` (tạm đặt `app/api` sang bên). App gọi `article` của web qua `NEXT_PUBLIC_API_BASE` (mặc định `https://lexica.cortexlearn.app`).
- `ios/`, `android/`: dự án gốc. `resources/`: icon và màn khởi động từ logo (`pnpm native:assets` tạo lại).
- `NativeShell`: ẩn màn khởi động, mở link `lexica://` và `https://lexica.cortexlearn.app/...` trong app, báo khi mất mạng.

## Trước khi build: biến môi trường
Giá trị `NEXT_PUBLIC_*` được ghi cứng vào app lúc build. Tạo `apps/lexica/.env.production.local` (đã nằm trong `.gitignore`) với ít nhất `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CORTEX_API_URL`; thêm `NEXT_PUBLIC_CONTENT_MANIFEST_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN` nếu bản web có dùng. Thiếu ba biến đầu thì `pnpm native:build` dừng lại. Đừng đưa khóa vào chat hay vào repo.
Cortex API cần deploy lại với CORS mới cho app (`capacitor://localhost`, `https://localhost`).

## Chạy Android (Mac hoặc Linux, cần Android Studio)
```
cd apps/lexica
pnpm native:build          # build tĩnh + cap sync
npx cap open android       # mở Android Studio, bấm Run
```

## Chạy iOS (chỉ Mac, cần Xcode và CocoaPods)
```
cd apps/lexica
pnpm native:build
cd ios/App && pod install && cd ../..
npx cap open ios           # chọn máy thật, đặt Team (tài khoản Apple Developer), Run
```

## N2: nút Chia sẻ
- **Android (đã viết, chưa thử trên máy):** `MainActivity.java` đổi lượt chia sẻ văn bản thành link `lexica://num-van?text=…`, `NativeShell` mở link đó trong Blend (cả khi app đang tắt lẫn đang chạy). Thử: trong Chrome bấm Chia sẻ một bài báo, chọn Lexica.
- **iPhone (mã đã viết, chưa có target trong Xcode, chưa thử):** mã nằm ở `ios/ShareExtension/` (`ShareViewController.swift`, `Info.plist`). Tạo target một lần trên Mac:
  1. Mở `ios/App/App.xcodeproj` trong Xcode, menu File → New → Target → **Share Extension**, đặt tên `ShareExtension`, ngôn ngữ Swift.
  2. Xóa `ShareViewController.swift`, `MainInterface.storyboard` và `Info.plist` Xcode vừa tạo. Kéo các file trong `ios/ShareExtension/` vào target đó.
  3. Trong Info.plist của extension không có `NSExtensionMainStoryboard` (đã dùng `NSExtensionPrincipalClass`).
  4. Đặt Team cho cả hai target, bundle id của extension là `app.cortexlearn.lexica.ShareExtension`.
  - Facebook thường chỉ chia sẻ link bài viết, mà máy chủ không tải được link Facebook. Với Facebook, người dùng chọn chữ rồi chia sẻ chữ.

## N3: tiện ích Safari (mới chuẩn bị, chưa thử trên Safari)
**Đã làm:** `node extension/build.mjs --safari` (trong `apps/lexica`) tạo `extension/dist-safari/`: cùng mã với bản Chrome, chỉ khác manifest. Safari khai các trang trong `host_permissions` (Apple khuyên vậy) thay cho `optional_host_permissions`; người dùng bật từng trang trong Safari → Cài đặt → Tiện ích. Có test cho phần này.

**Việc trên Mac (một lần):** trong Xcode mở `ios/App/App.xcodeproj`, File → New → Target → **Safari Extension** (iOS), đặt tên `LexicaBlend`, bundle id `app.cortexlearn.lexica.blend`. Thay nội dung thư mục Resources của target bằng nội dung `extension/dist-safari/`. Có thể thử nhanh cách khác: `xcrun safari-web-extension-converter extension/dist-safari --app-name "Lexica Blend" --bundle-identifier app.cortexlearn.lexica.blend` (kiểm tra `--help`), nó tạo một app riêng để thử. Bật tiện ích: Cài đặt iPhone → Safari → Tiện ích mở rộng.

**Chưa kiểm chứng, nên mong sẽ phải sửa khi thử thật:**
- `permissions.request` cho từng trang: Apple không ghi rõ cho Safari. Nếu popup không xin được quyền, cách sửa là bỏ bước xin quyền ở bản Safari và để Safari tự hỏi.
- `scripting.registerContentScripts`: Safari hỗ trợ từ 16.4, có báo cáo lỗi ở 16.6 làm mất content script khai trong manifest. Cần thử trên bản Safari bạn dùng.
- Cầu nối tài khoản (`bridge.js`) chỉ chạy khi bạn mở `lexica.cortexlearn.app` **trong Safari**, không chạy trong WebView của app. Vậy muốn nối tài khoản phải mở trang web Lexica trong Safari một lần.
- Đồng bộ mức và trang đã bật giữa app và tiện ích (App Group, native messaging): **chưa làm**.
- Apple xét duyệt tiện ích cùng app. Trang web trên `host_permissions` rộng có thể bị hỏi lý do: ghi trong mô tả rằng tiện ích chỉ chạy trên trang người dùng bật, không bao giờ trên trang ngân hàng, email, đăng nhập (đúng như `/privacy`).

## Chưa làm trong N1
- Đăng nhập bằng Apple (cần bật nhà cung cấp Apple trong Supabase và khóa từ Apple Developer).
- Thông báo đẩy (APNs, FCM): cần khóa của bạn, nối với `docs/LEXICA_PUSH_SPEC.md`.
- Deep link `lexica://` đã khai báo scheme trong `Info.plist` và `AndroidManifest.xml`, chưa thử trên máy. Chưa có Universal Links (link `https://lexica.cortexlearn.app` mở thẳng app): cần file `apple-app-site-association` và `assetlinks.json` trên web, và Team ID của bạn.
- TestFlight, Play Internal Testing.
