"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  UserMinus,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Clock,
  Star,
  Check,
  X,
  Flame,
} from "lucide-react";

interface FriendsScreenProps {
  onBack: () => void;
}

interface Friend {
  id: string;
  name: string;
  band: string;
  status: "online" | "offline" | "in-call";
  lastActive?: string;
  sessions: number;
  streak: number;
  mutualSessions?: number;
}

interface FriendRequest {
  id: string;
  name: string;
  band: string;
  mutualFriends: number;
  sentAt: string;
}

// Tab Button Component
function TabButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 lg:px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${active
          ? "bg-[#80c0f4] text-white"
          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
        }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: Friend["status"] }) {
  const config = {
    online: { color: "bg-emerald-500", text: "Online" },
    offline: { color: "bg-zinc-600", text: "Offline" },
    "in-call": { color: "bg-[#80c0f4]", text: "In Call" },
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${config[status].color}`} />
      <span className="text-xs text-zinc-500">{config[status].text}</span>
    </div>
  );
}

// Friend Card Component
function FriendCard({
  friend,
  onInvite,
  onRemove,
}: {
  friend: Friend;
  onInvite: () => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all group">
      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${friend.status === "online"
              ? "bg-gradient-to-br from-[#80c0f4] to-[#add5f5]"
              : friend.status === "in-call"
                ? "bg-gradient-to-br from-[#80c0f4] to-[#add5f5]"
                : "bg-gradient-to-br from-zinc-600 to-zinc-700"
            }`}
        >
          {friend.name.charAt(0)}
        </div>
        {friend.status !== "offline" && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#050505] ${friend.status === "online" ? "bg-emerald-500" : "bg-[#80c0f4]"
              }`}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white truncate">{friend.name}</h3>
          {friend.streak >= 7 && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/20">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs font-medium text-orange-400">
                {friend.streak}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-zinc-500">Band {friend.band}</span>
          <StatusBadge status={friend.status} />
        </div>
      </div>

      {/* Stats - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-4">
        {friend.mutualSessions !== undefined && (
          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              {friend.mutualSessions}
            </p>
            <p className="text-xs text-zinc-500">Sessions together</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {friend.status === "online" && (
          <button
            onClick={onInvite}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#80c0f4] hover:bg-[#6db0e4] text-white text-sm font-medium transition-all"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        )}
        {friend.status === "in-call" && (
          <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-400">
            Busy
          </span>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 p-2 rounded-xl bg-zinc-800 border border-white/10 shadow-xl z-10">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-700 text-sm text-zinc-300 transition-all">
                <MessageCircle className="w-4 h-4" />
                Send Message
              </button>
              <button
                onClick={onRemove}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400 transition-all"
              >
                <UserMinus className="w-4 h-4" />
                Remove Friend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Friend Request Card Component
function FriendRequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#80c0f4]/5 to-[#add5f5]/5 border border-[#80c0f4]/20">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-white font-semibold">
        {request.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{request.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-zinc-500">Band {request.band}</span>
          {request.mutualFriends > 0 && (
            <span className="text-xs text-zinc-500">
              {request.mutualFriends} mutual friends
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={onDecline}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Suggested Friend Card Component
function SuggestedFriendCard({
  friend,
  onAdd,
}: {
  friend: Friend;
  onAdd: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-white font-semibold">
          {friend.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{friend.name}</h4>
          <p className="text-xs text-zinc-500">Band {friend.band}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
        <Star className="w-3 h-3" />
        <span>{friend.sessions} sessions</span>
      </div>
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#80c0f4]/10 hover:bg-[#80c0f4]/20 text-[#80c0f4] text-sm font-medium transition-all"
      >
        <UserPlus className="w-4 h-4" />
        Add Friend
      </button>
    </div>
  );
}

// Main Friends Screen Component
export default function FriendsScreen({ onBack }: FriendsScreenProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "find">(
    "friends"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const friends: Friend[] = [
    {
      id: "1",
      name: "Sarah Chen",
      band: "7.5",
      status: "online",
      sessions: 45,
      streak: 14,
      mutualSessions: 8,
    },
    {
      id: "2",
      name: "Alex Kim",
      band: "7.0",
      status: "in-call",
      sessions: 42,
      streak: 9,
      mutualSessions: 5,
    },
    {
      id: "3",
      name: "Mohammed Ali",
      band: "7.0",
      status: "online",
      sessions: 38,
      streak: 12,
      mutualSessions: 3,
    },
    {
      id: "4",
      name: "Emma Wilson",
      band: "6.5",
      status: "offline",
      lastActive: "2 hours ago",
      sessions: 35,
      streak: 5,
      mutualSessions: 6,
    },
    {
      id: "5",
      name: "James Lee",
      band: "6.5",
      status: "offline",
      lastActive: "1 day ago",
      sessions: 33,
      streak: 8,
      mutualSessions: 2,
    },
  ];

  const friendRequests: FriendRequest[] = [
    {
      id: "r1",
      name: "Sofia Garcia",
      band: "6.5",
      mutualFriends: 3,
      sentAt: "2 hours ago",
    },
    {
      id: "r2",
      name: "David Wang",
      band: "6.0",
      mutualFriends: 1,
      sentAt: "1 day ago",
    },
  ];

  const suggestedFriends: Friend[] = [
    { id: "s1", name: "Priya Patel", band: "6.0", status: "online", sessions: 25, streak: 4 },
    { id: "s2", name: "Tom Brown", band: "5.5", status: "offline", sessions: 22, streak: 1 },
    { id: "s3", name: "Lisa Zhang", band: "6.5", status: "online", sessions: 30, streak: 6 },
    { id: "s4", name: "Carlos Ruiz", band: "7.0", status: "offline", sessions: 40, streak: 10 },
  ];

  const onlineFriends = friends.filter((f) => f.status === "online");
  const offlineFriends = friends.filter((f) => f.status !== "online");

  const filteredFriends = searchQuery
    ? friends.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : null;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Friends
              </h1>
              <p className="text-xs text-zinc-500">
                {friends.length} friends • {onlineFriends.length} online
              </p>
            </div>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#80c0f4]/50 focus:border-[#80c0f4]/50 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton
            label="Friends"
            active={activeTab === "friends"}
            onClick={() => setActiveTab("friends")}
          />
          <TabButton
            label="Requests"
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            count={friendRequests.length}
          />
          <TabButton
            label="Find Friends"
            active={activeTab === "find"}
            onClick={() => setActiveTab("find")}
          />
        </div>

        {/* Content */}
        {activeTab === "friends" && (
          <div className="space-y-6">
            {/* Search Results */}
            {filteredFriends && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-500">
                  Search Results ({filteredFriends.length})
                </h3>
                {filteredFriends.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-8 text-center">
                    No friends found matching &quot;{searchQuery}&quot;
                  </p>
                ) : (
                  filteredFriends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      onInvite={() => { }}
                      onRemove={() => { }}
                    />
                  ))
                )}
              </div>
            )}

            {/* Normal View */}
            {!filteredFriends && (
              <>
                {/* Online Friends */}
                {onlineFriends.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Online Now ({onlineFriends.length})
                    </h3>
                    {onlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onInvite={() => { }}
                        onRemove={() => { }}
                      />
                    ))}
                  </div>
                )}

                {/* Offline Friends */}
                {offlineFriends.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Offline ({offlineFriends.length})
                    </h3>
                    {offlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onInvite={() => { }}
                        onRemove={() => { }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {friendRequests.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-500">
                  Pending Requests ({friendRequests.length})
                </h3>
                {friendRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => { }}
                    onDecline={() => { }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500">No pending friend requests</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "find" && (
          <div className="space-y-6">
            {/* Suggested Friends */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4">
                Suggested for You
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedFriends.map((friend) => (
                  <SuggestedFriendCard
                    key={friend.id}
                    friend={friend}
                    onAdd={() => { }}
                  />
                ))}
              </div>
            </div>

            {/* Share Link */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#80c0f4]/10 to-[#add5f5]/10 border border-[#80c0f4]/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Invite Friends to ORATIO
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Share your referral link and get bonus XP!
                  </p>
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#80c0f4] hover:bg-[#6db0e4] text-white font-medium transition-all">
                  <UserPlus className="w-4 h-4" />
                  Copy Invite Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

