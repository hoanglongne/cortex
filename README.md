# CORTEX HUB

Hệ sinh thái EdTech luyện IELTS gồm nhiều app chuyên biệt, dùng chung một backend và một bộ type dữ liệu. Kiến trúc chi tiết: [`docs/CORTEX_SYSTEM_ARCHITECTURE.md`](docs/CORTEX_SYSTEM_ARCHITECTURE.md).

## Cấu trúc monorepo

| Đường dẫn | Package | Mô tả |
|---|---|---|
| `apps/cortex-core-api` | `@cortex/api` | Backend NestJS: action log, tiến trình người dùng, WebSocket (Socket.io), Redis, Supabase |
| `apps/landing` | `@cortex/landing` | Trang giới thiệu hệ sinh thái (Next.js) |
| `apps/lexica` | `@cortex/lexica` | Học từ vựng qua truyện, thuật toán ELO + SRS, PWA |
| `apps/oratio` | `@cortex/oratio` | Luyện nói P2P theo thời gian thực (LiveKit), giả lập phòng thi |
| `apps/solilo` | `@cortex/solilo` | Luyện nói cá nhân, tập trung fluency và phát âm |
| `apps/synapse` | `@cortex/synapse` | Game kịch bản giao diện terminal |
| `packages/cortex-types` | `@cortex/types` | Type dùng chung giữa các app và API ([hướng dẫn](docs/SHARED_TYPES_GUIDE.md)) |
| `packages/ui` | `@repo/ui` | Component React dùng chung |
| `packages/eslint-config`, `packages/typescript-config` | | Cấu hình ESLint / TypeScript dùng chung |
| `scripts/` | | Script `curl` giả lập luồng dữ liệu tới API local |

## Bắt đầu

Yêu cầu: Node.js >= 20, pnpm 9.

```sh
pnpm install
pnpm dev                              # chạy tất cả app
pnpm dev --filter=@cortex/lexica      # chỉ chạy một app
```

Mỗi app cần file env riêng (Supabase, URL API...). Xem `.env*.example` và README trong từng app; hướng dẫn deploy ở [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Lệnh thường dùng

```sh
pnpm build         # build toàn bộ
pnpm lint          # ESLint
pnpm check-types   # tsc --noEmit
pnpm test          # unit test (Vitest cho Lexica, Jest cho API)
```

CI (`.github/workflows/ci.yml`) chạy lint, type check, test và build cho mọi PR vào `main`.

## Knowledge graph

`graphify-out/` chứa đồ thị code sinh bởi [graphify](https://pypi.org/project/graphifyy/) (`GRAPH_REPORT.md`, `graph.html`). Cập nhật sau khi đổi code:

```sh
pip install graphifyy
graphify update .
```
