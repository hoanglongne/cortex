# Hướng dẫn Real-time & Rewards (REALTIME_EVENTS_GUIDE.md)

Tài liệu này hướng dẫn cách sử dụng hệ thống sự kiện thời gian thực và kích hoạt phần thưởng (Rewards) xuyên ứng dụng.

## 1. Hệ thống Phần thưởng (Reward System)
Chúng ta có một `RewardHelper` service dùng chung để kích hoạt các hiệu ứng "phê" hóa cho người dùng.

### Cách sử dụng trong Core API:
```typescript
import { RewardHelper } from '../shared/reward-helper.service';

constructor(private rewardHelper: RewardHelper) {}

// Khi người dùng hoàn thành một nhiệm vụ
this.rewardHelper.triggerMilestoneReward(userId, 'COMPLETED_ORATIO_MATCH', 50);
```

### Các sự kiện được phát ra:
1. `ecosystem:milestone_reached`: Phát cho toàn bộ hệ thống (để hiển thị bảng tin/toast).
2. `user:milestone_reward`: Phát riêng cho người dùng đạt được (để nổ pháo hoa).

## 2. Kết nối từ Frontend (Client)
Để nhận được sự kiện, các app Frontend (Lexica, Oratio, Solilo) cần kết nối tới Socket server.

- **URL**: `http://localhost:3001/events`
- **Thư viện**: `socket.io-client`

### Ví dụ nhận hiệu ứng pháo hoa:
```javascript
socket.on('user:milestone_reward', (data) => {
  if (data.effect === 'confetti') {
    // Gọi hàm từ canvas-confetti
    confetti();
  }
  if (data.sound) {
    // Chơi âm thanh tương ứng
    new Audio(`/sounds/${data.sound}.mp3`).play();
  }
});
```

## 3. Luồng hoạt động của ActionLog
Khi một app gửi log về:
1. App gọi `POST /actions/log`.
2. Core API kiểm tra loại hành động.
3. Nếu là hành động "Mastery", `RewardHelper` tự động kích hoạt Real-time Event.
4. Client nhận Event và hiển thị UI/UX tương ứng.
