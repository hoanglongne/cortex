# Build app Lexica (Capacitor, cách B), hướng dẫn chạy trên máy bạn

Trạng thái: khung app đã có (N1 một phần). Chưa chạy thử trên thiết bị thật, nên các bước dưới là chỉ dẫn, chưa kiểm chứng.

## Đã có trong repo (`apps/lexica`)
- `capacitor.config.ts`: app id `app.cortexlearn.lexica` (**đổi trước lần nộp đầu tiên, sau đó không đổi được**), thư mục web `out`.
- `scripts/build-native.mjs`: build xuất tĩnh vào `out/` (tạm đặt `app/api` sang bên). App gọi `article` của web qua `NEXT_PUBLIC_API_BASE` (mặc định `https://lexica.cortexlearn.app`).
- `ios/`, `android/`: dự án gốc. `resources/`: icon và màn khởi động từ logo (`pnpm native:assets` tạo lại).
- `NativeShell`: ẩn màn khởi động, mở link `lexica://` và `https://lexica.cortexlearn.app/...` trong app, báo khi mất mạng.

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

## Chưa làm trong N1
- Đăng nhập bằng Apple (cần bật nhà cung cấp Apple trong Supabase và khóa từ Apple Developer).
- Thông báo đẩy (APNs, FCM): cần khóa của bạn, nối với `docs/LEXICA_PUSH_SPEC.md`.
- Deep link `lexica://` đã khai báo scheme trong `Info.plist` và `AndroidManifest.xml`, chưa thử trên máy. Chưa có Universal Links (link `https://lexica.cortexlearn.app` mở thẳng app): cần file `apple-app-site-association` và `assetlinks.json` trên web, và Team ID của bạn.
- TestFlight, Play Internal Testing.
