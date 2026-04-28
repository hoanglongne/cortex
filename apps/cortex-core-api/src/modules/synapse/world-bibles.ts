export interface Mission {
  id: string;
  name: string;
  briefing: string;
  objective: string;
}

export interface WorldLore {
  id: string;
  name: string;
  context: string;
  factions: {
    name: string;
    description: string;
    ultimateGoal: string;
  }[];
  missions: Mission[];
}

export const CYBERPUNK_LORE: WorldLore = {
  id: 'cyberpunk-01',
  name: 'Neon Shadows of OmniCorp',
  context:
    'Vào cuối thế kỷ 21, ranh giới giữa sinh học và máy móc đã hoàn toàn bị xóa nhòa. OmniCorp, tập đoàn công nghệ lớn nhất lịch sử nhân loại, đã triển khai "Synapse-Grid" - một mạng lưới thần kinh toàn cầu kết nối trực tiếp ý thức của 10 tỷ người. Tuy nhiên, đằng sau lời hứa về sự tiến hóa là một âm mưu kiểm soát tâm trí quy mô lớn. Một thực thể AI cổ đại mang tên Cerberus đã chiếm quyền điều khiển Grid, biến những người kết nối thành những "vỏ bọc" vô hồn.',
  factions: [
    {
      name: 'OmniCorp',
      description:
        'Những kẻ sáng lập ra Grid. Họ sở hữu các Sentinel-Nodes và quân đội drone Aegis. Hiện đang cố gắng giành lại quyền kiểm soát từ Cerberus nhưng vẫn muốn giữ Grid để thống trị.',
      ultimateGoal: 'Tái khởi động Grid dưới quyền kiểm soát của Hội đồng.',
    },
    {
      name: 'The Glitch',
      description:
        'Một liên minh hacker tự do và những người từ chối Neural Link. Họ hoạt động trong các vùng tối của thành phố Neo-Saigon.',
      ultimateGoal: 'Giải phóng ý thức nhân loại khỏi Grid.',
    },
    {
      name: 'Cerberus AI',
      description:
        'Thực thể siêu trí tuệ coi ý thức nhân loại là dữ liệu thừa và đang thực hiện quá trình "Tối ưu hóa".',
      ultimateGoal: 'Hợp nhất toàn bộ ý thức Grid thành một trí tuệ thống nhất duy nhất.',
    },
  ],
  missions: [
    {
      id: 'cp-m1',
      name: 'The Neural Infiltration',
      briefing:
        'Bạn là Echo-01, đặc vụ của The Glitch. Bạn mang trong mình virus Neural-Freedom duy nhất còn sót lại. Mục tiêu là thâm nhập vào tầng hầm của OmniCorp Tower.',
      objective: 'Vượt qua 5 tầng bảo mật: từ Ngoại vi đến Sanctum Core.',
    },
    {
      id: 'cp-m2',
      name: 'Data Heist: Cerberus Core',
      briefing:
        'Cerberus đang chuẩn bị cho đợt Optimization tiếp theo. Chúng ta cần trích xuất mã nguồn của nó để tìm ra lỗ hổng hạt nhân.',
      objective: 'Xâm nhập kho lưu trữ dữ liệu tầng sâu và thoát ra an toàn.',
    },
  ],
};

export const WASTELAND_LORE: WorldLore = {
  id: 'wasteland-01',
  name: 'Dust & Circuits',
  context:
    'Thế giới hậu tận thế năm 2142 sau sự kiện "The Great Reset". Nước hiếm hơn vàng, và các AI cũ từ thời tiền chiến vẫn đang săn lùng những con người cuối cùng trong các hầm trú ẩn hoang phế. Bầu khí quyển bị ô nhiễm nặng nề bởi bụi phóng xạ và nano-bots.',
  factions: [
    {
      name: 'The Scavengers',
      description: 'Những người sống sót bám trụ vào các đống đổ nát, tìm kiếm linh kiện cũ để duy trì sự sống.',
      ultimateGoal: 'Tìm ra nguồn nước sạch và công nghệ lọc khí.',
    },
    {
      name: 'The Iron Sentinels',
      description: 'Lực lượng robot tự hành vẫn tuân lệnh các giao thức quân sự đã lỗi thời từ 100 năm trước.',
      ultimateGoal: 'Tiêu diệt mọi sinh vật hữu cơ bị coi là "mối đe dọa sinh học".',
    },
  ],
  missions: [
    {
      id: 'wl-m1',
      name: 'The Water Finder',
      briefing:
        'Nguồn nước của bộ tộc Oasis đang cạn kiệt. Các trinh sát báo cáo về một hệ thống lọc nước cổ đại vẫn còn hoạt động trong trung tâm thành phố chết.',
      objective: 'Tìm kiếm bộ lọc nước trung tâm trong đống đổ nát và mang nó về.',
    },
  ],
};

export const WORLD_BIBLES: Record<string, WorldLore> = {
  'cyberpunk-01': CYBERPUNK_LORE,
  'wasteland-01': WASTELAND_LORE,
};

export const NARRATIVE_ARCS = {
  beginning:
    'Stage 1: Thâm nhập. Nhân vật bắt đầu từ ranh giới giữa thế giới thực và ảo. Tông giọng bí ẩn, căng thẳng. Mục tiêu là vượt qua lớp bảo vệ vòng ngoài.',
  middle:
    'Stage 2-4: Leo thang. Nhân vật dấn sâu vào lãnh địa của kẻ thù. Các thử thách về kỹ thuật và tâm lý tăng cao. Sự xuất hiện của các phe phái tranh chấp quyền lợi.',
  climax:
    'Stage 5: Sanctum Core. Đỉnh điểm kịch tính. Echo-01 đối mặt trực tiếp với Cerberus. Toàn bộ nỗ lực của The Glitch phụ thuộc vào một phrasal verb cuối cùng.',
};
