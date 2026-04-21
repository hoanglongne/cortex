# Hướng dẫn Sử dụng Shared Types (`@cortex/types`)

Gói `@cortex/types` là "ngôn ngữ chung" cho toàn bộ hệ sinh thái CORTEX HUB. Tài liệu này hướng dẫn cách cài đặt, sử dụng và mở rộng gói này.

## 1. Cài đặt cho một App mới
Trong thư mục của app (ví dụ: `apps/my-new-app`), chạy:
```bash
pnpm add @cortex/types --workspace
```
Hoặc thêm thủ công vào `package.json`:
```json
"dependencies": {
  "@cortex/types": "workspace:*"
}
```

## 2. Sử dụng Mappers (Cầu nối dữ liệu)
Không nên sửa code hiện có của các app để dùng shared types trực tiếp. Thay vào đó, hãy dùng **Mapper Pattern**.

### Ví dụ: Chuyển đổi điểm số từ Local sang Shared
```typescript
import { AssessmentMetrics } from '@cortex/types';
import { LocalScores } from '../types';

export const mapToSharedMetrics = (local: LocalScores): AssessmentMetrics => ({
  fluency: local.fluency_score,
  vocabulary: local.lexical_resource,
  grammar: local.grammar_range,
  pronunciation: local.pronunciation_accuracy,
  overall: local.band_score,
  bandScore: local.band_score
});
```

## 3. Mở rộng Shared Types
Nếu bạn cần thêm một trường dữ liệu mới dùng chung cho nhiều app:
1. Sửa file `packages/cortex-types/index.ts`.
2. Định nghĩa interface hoặc type mới.
3. Export nó ra.
4. Chạy `pnpm install` ở root để cập nhật symlinks.
5. (Tùy chọn) Chạy `Restart TS Server` trong IDE nếu không thấy gợi ý code mới.

## 4. Danh sách các Types quan trọng
- `AppSource`: Định danh nguồn của dữ liệu ('lexica', 'oratio', 'solilo', v.v.)
- `ProficiencyLevel`: 'beginner' | 'intermediate' | 'advanced' | 'expert'
- `AssessmentMetrics`: Bộ khung chấm điểm ngôn ngữ tiêu chuẩn.
- `ActionLog`: Cấu trúc nhật ký hoạt động người dùng.
