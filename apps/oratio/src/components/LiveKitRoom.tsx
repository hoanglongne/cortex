"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LiveKitRoom as LKRoom,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useLiveKitToken } from "@/hooks/useMatchmaking";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

interface LiveKitRoomProps {
  roomId: string;
  username: string;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

/**
 * LiveKit Room Wrapper Component
 *
 * Handles token fetching and room connection.
 * Provides audio-only conference UI optimized for ORATIO.
 */
export default function LiveKitRoom({
  roomId,
  username,
  onDisconnect,
  onError,
}: LiveKitRoomProps) {
  const { token, isLoading, error, getToken } = useLiveKitToken();
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  // Fetch token on mount
  useEffect(() => {
    async function connect() {
      try {
        setIsConnecting(true);
        const result = await getToken(roomId, username);
        setLivekitUrl(result.livekitUrl);
      } catch (err) {
        console.error("Failed to get LiveKit token:", err);
        onError?.(err instanceof Error ? err.message : "Failed to connect");
      } finally {
        setIsConnecting(false);
      }
    }

    connect();
  }, [roomId, username, getToken, onError]);

  if (isConnecting || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#050505] rounded-2xl">
        <LoadingSpinner size="md" message="Connecting to room..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 text-lg">Connection Error</div>
        <p className="text-zinc-400">{error}</p>
        <Button
          onClick={() => getToken(roomId, username)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!token || !livekitUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-zinc-400">Waiting for connection...</p>
      </div>
    );
  }

  return (
    <LKRoom
      serverUrl={livekitUrl}
      token={token}
      audio={true}
      video={false}
      onDisconnected={() => {
        console.log("Disconnected from room");
        onDisconnect?.();
      }}
      onError={(err) => {
        console.error("LiveKit room error:", err);
        onError?.(err.message);
      }}
    >
      <AudioConference onLeave={onDisconnect} />
    </LKRoom>
  );
}

/**
 * Audio Conference UI
 * Custom audio-only interface for voice practice
 */
function AudioConference({ onLeave }: { onLeave?: () => void }) {
  const room = useRoomContext();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Microphone]);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(async () => {
    if (!room.localParticipant) return;

    if (isMuted) {
      await room.localParticipant.setMicrophoneEnabled(true);
    } else {
      await room.localParticipant.setMicrophoneEnabled(false);
    }
    setIsMuted(!isMuted);
  }, [room.localParticipant, isMuted]);

  const handleLeave = useCallback(async () => {
    await room.disconnect();
    onLeave?.();
  }, [room, onLeave]);

  // Get remote participant (the other person in the call)
  const remoteParticipant = participants.find(
    (p) => p.identity !== room.localParticipant?.identity
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
      {/* Audio renderer - plays all audio tracks */}
      <RoomAudioRenderer />

      {/* Participant status */}
      <div className="flex flex-col items-center gap-4">
        {/* Local participant */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-800">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white">You</span>
          {isMuted ? (
            <MicOff className="w-4 h-4 text-red-400" />
          ) : (
            <Mic className="w-4 h-4 text-green-400" />
          )}
        </div>

        {/* Remote participant */}
        {remoteParticipant ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-800">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-white">{remoteParticipant.name || "Partner"}</span>
            <Volume2 className="w-4 h-4 text-blue-400" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-700">
            <div className="w-3 h-3 rounded-full bg-zinc-500" />
            <span className="text-zinc-400">Waiting for partner...</span>
          </div>
        )}
      </div>

      {/* Active audio indicators */}
      <div className="flex gap-2">
        {tracks.map((track) => (
          <AudioIndicator
            key={track.participant.identity}
            isLocal={track.participant.identity === room.localParticipant?.identity}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleMute}
          variant="outline"
          size="lg"
          className={`rounded-full w-14 h-14 ${isMuted
            ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
            : "bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
            }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          onClick={handleLeave}
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Fallback ControlBar (hidden but functional) */}
      <div className="sr-only">
        <ControlBar />
      </div>
    </div>
  );
}

/**
 * Audio activity indicator
 */
function AudioIndicator({ isLocal }: { isLocal: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full ${isLocal ? "bg-green-500" : "bg-blue-500"
            }`}
          style={{
            height: `${8 + Math.random() * 16}px`,
            animation: "audioWave1 0.8s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

