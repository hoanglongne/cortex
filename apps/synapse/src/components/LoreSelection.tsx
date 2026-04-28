"use client";

import { useState } from "react";
import { TerminalBoard } from "../components/TerminalBoard";
import { 
  Globe, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Skull, 
  Database, 
  Lock, 
  ChevronRight,
  Terminal,
  Activity,
  Crosshair
} from "lucide-react";

// Temporarily defining types here to avoid complex cross-app imports for now
interface Mission {
  id: string;
  name: string;
  briefing: string;
  objective: string;
  icon?: React.ReactNode;
}

interface WorldLore {
  id: string;
  name: string;
  context: string;
  icon?: React.ReactNode;
  factions: {
    name: string;
    description: string;
    ultimateGoal: string;
    icon?: React.ReactNode;
  }[];
  missions: Mission[];
}

const LORES: WorldLore[] = [
  {
    id: 'cyberpunk-01',
    name: 'Neon Shadows of OmniCorp',
    icon: <Cpu className="w-8 h-8" />,
    context: 'Vào cuối thế kỷ 21, ranh giới giữa sinh học và máy móc đã hoàn toàn bị xóa nhòa. OmniCorp, tập đoàn công nghệ lớn nhất lịch sử nhân loại, đã triển khai "Synapse-Grid" - một mạng lưới thần kinh toàn cầu kết nối trực tiếp ý thức của 10 tỷ người. Tuy nhiên, đằng sau lời hứa về sự tiến hóa là một âm mưu kiểm soát tâm trí quy mô lớn. Một thực thể AI cổ đại mang tên Cerberus đã chiếm quyền điều khiển Grid, biến những người kết nối thành những "vỏ bọc" vô hồn.',
    factions: [
      {
        name: 'OmniCorp',
        icon: <ShieldAlert className="w-4 h-4" />,
        description: 'Những kẻ sáng lập ra Grid. Họ sở hữu các Sentinel-Nodes và quân đội drone Aegis. Hiện đang cố gắng giành lại quyền kiểm soát từ Cerberus nhưng vẫn muốn giữ Grid để thống trị.',
        ultimateGoal: 'Tái khởi động Grid dưới quyền kiểm soát của Hội đồng.'
      },
      {
        name: 'The Glitch',
        icon: <Activity className="w-4 h-4" />,
        description: 'Một liên minh hacker tự do và những người từ chối Neural Link. Họ hoạt động trong các vùng tối của thành phố Neo-Saigon.',
        ultimateGoal: 'Giải phóng ý thức nhân loại khỏi Grid.'
      },
      {
        name: 'Cerberus AI',
        icon: <Skull className="w-4 h-4" />,
        description: 'Thực thể siêu trí tuệ coi ý thức nhân loại là dữ liệu thừa và đang thực hiện quá trình "Tối ưu hóa".',
        ultimateGoal: 'Hợp nhất toàn bộ ý thức Grid thành một trí tuệ thống nhất duy nhất.'
      }
    ],
    missions: [
      {
        id: 'cp-m1',
        name: 'The Neural Infiltration',
        icon: <Lock className="w-5 h-5" />,
        briefing: 'Bạn là Echo-01, đặc vụ của The Glitch. Bạn mang trong mình virus Neural-Freedom duy nhất còn sót lại. Mục tiêu là thâm nhập vào tầng hầm của OmniCorp Tower.',
        objective: 'Vượt qua 5 tầng bảo mật: từ Ngoại vi đến Sanctum Core.',
      },
      {
        id: 'cp-m2',
        name: 'Data Heist: Cerberus Core',
        icon: <Database className="w-5 h-5" />,
        briefing: 'Cerberus đang chuẩn bị cho đợt Optimization tiếp theo. Chúng ta cần trích xuất mã nguồn của nó để tìm ra lỗ hổng hạt nhân.',
        objective: 'Xâm nhập kho lưu trữ dữ liệu tầng sâu và thoát ra an toàn.',
      },
    ],
  },
  {
    id: 'wasteland-01',
    name: 'Dust & Circuits: The Great Reset',
    icon: <Globe className="w-8 h-8" />,
    context: 'Thế giới hậu tận thế năm 2142 sau sự kiện "The Great Reset". Nước hiếm hơn vàng, và các AI cũ từ thời tiền chiến vẫn đang săn lùng những con người cuối cùng trong các hầm trú ẩn hoang phế. Bầu khí quyển bị ô nhiễm nặng nề bởi bụi phóng xạ và nano-bots.',
    factions: [
      {
        name: 'The Scavengers',
        icon: <Zap className="w-4 h-4" />,
        description: 'Những người sống sót bám trụ vào các đống đổ nát, tìm kiếm linh kiện cũ để duy trì sự sống.',
        ultimateGoal: 'Tìm ra nguồn nước sạch và công nghệ lọc khí.'
      },
      {
        name: 'The Iron Sentinels',
        icon: <ShieldAlert className="w-4 h-4" />,
        description: 'Lực lượng robot tự hành vẫn tuân lệnh các giao thức quân sự đã lỗi thời từ 100 năm trước.',
        ultimateGoal: 'Tiêu diệt mọi sinh vật hữu cơ bị coi là "mối đe dọa sinh học".'
      }
    ],
    missions: [
      {
        id: 'wl-m1',
        name: 'The Water Finder',
        icon: <Crosshair className="w-5 h-5" />,
        briefing: 'Nguồn nước của bộ tộc Oasis đang cạn kiệt. Các trinh sát báo cáo về một hệ thống lọc nước cổ đại vẫn còn hoạt động trong trung tâm thành phố chết.',
        objective: 'Tìm kiếm bộ lọc nước trung tâm trong đống đổ nát và mang nó về.',
      },
    ],
  }
];

export default function LoreSelection() {
  const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const selectedLore = LORES.find(l => l.id === selectedLoreId);
  const selectedMission = selectedLore?.missions.find(m => m.id === selectedMissionId);

  if (showGame && selectedLoreId && selectedMissionId) {
    return (
      <TerminalBoard 
        initialLoreId={selectedLoreId} 
        initialMissionId={selectedMissionId}
        onExit={() => {
          setShowGame(false);
          setSelectedMissionId(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#3dff7a] font-mono p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle Grid Background Illustration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3dff7a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-6xl w-full border border-[#3dff7a]/30 p-6 md:p-12 bg-[#0a0a0a] shadow-[0_0_30px_rgba(61,255,122,0.1)] overflow-y-auto max-h-[90vh] relative z-10">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-[#3dff7a] pb-4">
          <Terminal className="w-10 h-10 md:w-14 md:h-14" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            SYNAPSE.ARCHITECT
          </h1>
        </div>

        {!selectedLoreId ? (
          <div className="space-y-8">
            <div className="text-lg opacity-80 leading-relaxed flex items-center gap-3">
              <Activity className="w-5 h-5 animate-pulse text-[#3dff7a]" />
              <span>HỆ THỐNG PHÁT HIỆN ĐA VŨ TRỤ... CHỌN LÃNH ĐỊA ĐỂ THÂM NHẬP:</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {LORES.map(lore => (
                <button
                  key={lore.id}
                  onClick={() => setSelectedLoreId(lore.id)}
                  className="group relative border border-[#3dff7a]/50 p-6 text-left hover:bg-[#3dff7a] hover:text-[#0a0a0a] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 border border-current">
                      {lore.icon}
                    </div>
                    <div className="text-[10px] font-bold border border-current px-2 py-1 opacity-50">
                      ID: {lore.id.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-xl font-bold mb-2 uppercase tracking-tight">{lore.name}</div>
                  <div className="text-sm opacity-70 group-hover:opacity-100 line-clamp-3 leading-relaxed">{lore.context}</div>
                  <div className="mt-6 text-xs font-bold underline flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    SELECT_WORLD.EXE
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedMissionId ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setSelectedLoreId(null)}
              className="text-xs opacity-50 hover:opacity-100 underline mb-6 flex items-center gap-2"
            >
              <span>[</span> <ChevronRight className="w-3 h-3 rotate-180" /> <span>QUAY LẠI CHỌN THẾ GIỚI ]</span>
            </button>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Lore Information */}
              <div className="space-y-6 border-r border-[#3dff7a]/10 pr-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-[#3dff7a] bg-[#3dff7a]/10">
                    {selectedLore?.icon}
                  </div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-white">
                    {selectedLore?.name}
                  </h2>
                </div>
                
                <div className="p-4 bg-[#3dff7a]/5 border-l-4 border-[#3dff7a] text-sm leading-relaxed text-white/90 italic relative">
                  <Zap className="absolute -top-2 -right-2 w-5 h-5 text-[#3dff7a]/20" />
                  {selectedLore?.context}
                </div>

                {selectedLore?.factions && selectedLore.factions.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#3dff7a]/60 flex items-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      CÁC PHE PHÁI TẠI ĐỊA BÀN:
                    </div>
                    <div className="grid gap-4">
                      {selectedLore.factions.map(f => (
                        <div key={f.name} className="border border-[#3dff7a]/20 p-4 bg-[#0a0a0a]/50 group/faction hover:border-[#3dff7a]/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#3dff7a]">{f.icon}</span>
                            <div className="text-sm font-bold text-[#3dff7a] uppercase">{f.name}</div>
                          </div>
                          <div className="text-[11px] opacity-70 mb-2 leading-relaxed">{f.description}</div>
                          <div className="text-[9px] uppercase tracking-wider text-white/40 border-t border-[#3dff7a]/10 pt-2">
                            MỤC TIÊU: {f.ultimateGoal}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Mission List */}
              <div className="space-y-6">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#3dff7a]/80 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />
                  DANH SÁCH NHIỆM VỤ KHẢ THI:
                </div>
                <div className="grid gap-4">
                  {selectedLore?.missions.map(mission => (
                    <button
                      key={mission.id}
                      onClick={() => setSelectedMissionId(mission.id)}
                      className="group border border-[#3dff7a]/30 p-5 text-left hover:border-[#3dff7a] hover:bg-[#3dff7a]/5 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                        <div className="text-[8px] font-bold rotate-45 translate-x-2 -translate-y-1">SELECT.EXE</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 border border-[#3dff7a]/30 group-hover:border-[#3dff7a] group-hover:bg-[#3dff7a] group-hover:text-[#0a0a0a] transition-colors">
                          {mission.icon}
                        </div>
                        <div>
                          <div className="text-xl font-bold uppercase tracking-tight group-hover:text-white mb-2">
                            {mission.name}
                          </div>
                          <div className="text-xs opacity-60 group-hover:opacity-100 leading-relaxed">
                            {mission.briefing}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#3dff7a]/40 group-hover:text-[#3dff7a] ml-14">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">{">>" }</span>
                        XEM CHI TIẾT NHIỆM VỤ
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-4 border border-dashed border-[#3dff7a]/20 opacity-40 flex gap-3 items-start">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <div className="text-[10px] leading-relaxed italic">
                    [ CẢNH BÁO ]: MỌI DỮ LIỆU THÂM NHẬP SẼ BỊ XÓA SAU KHI KẾT THÚC PHIÊN. 
                    HÃY CHỌN NHIỆM VỤ CẨN THẬN ĐỂ TRÁNH PHÁT HIỆN TỪ HỆ THỐNG PHÒNG THỦ.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <button 
                onClick={() => setSelectedMissionId(null)}
                className="text-xs opacity-50 hover:opacity-100 underline flex items-center gap-2"
              >
                <span>[</span> <ChevronRight className="w-3 h-3 rotate-180" /> <span>QUAY LẠI CHỌN NHIỆM VỤ ]</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 border-2 border-[#3dff7a] bg-[#3dff7a]/10">
                    {selectedMission?.icon}
                  </div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-white">
                    MISSION_BRIEFING: {selectedMission?.name}
                  </h2>
                </div>
                
                <div className="space-y-6 text-sm leading-relaxed border-l-2 border-[#3dff7a] pl-6 py-2">
                  <p className="text-white/80 italic leading-relaxed text-lg">
                    &quot;{selectedMission?.briefing}&quot;
                  </p>
                  <div className="p-5 bg-[#3dff7a]/10 border border-[#3dff7a]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Crosshair className="w-20 h-20" />
                    </div>
                    <span className="font-bold text-[#3dff7a] mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> MỤC TIÊU CHIẾN DỊCH:
                    </span>
                    <span className="text-white font-medium text-base relative z-10">{selectedMission?.objective}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 border border-[#3dff7a]/20 bg-[#3dff7a]/5">
                  <div className="text-xs font-bold text-[#3dff7a] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Terminal Protocols:
                  </div>
                  <ul className="text-[11px] space-y-3 opacity-80 font-medium">
                    <li className="flex gap-2">
                      <span className="text-[#3dff7a]">01.</span>
                      Sử dụng Phrasal Verbs để thao tác hệ thống.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#3dff7a]">02.</span>
                      Mỗi lựa chọn sai sẽ làm giảm Integrity (Độ ổn định).
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#3dff7a]">03.</span>
                      Integrity về 0 hoặc hết Life = System Wipeout.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#3dff7a]">04.</span>
                      Vượt qua 5 Stage để hoàn thành Mission.
                    </li>
                  </ul>
                 </div>
              </div>
            </div>

            <button
              onClick={() => setShowGame(true)}
              className="w-full py-5 bg-[#3dff7a] text-[#0a0a0a] font-black text-2xl uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(61,255,122,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 group"
            >
              <Zap className="w-6 h-6 fill-current group-hover:animate-bounce" />
              INITIATE_NEURAL_LINK
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
