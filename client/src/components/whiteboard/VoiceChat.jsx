import React, { useState, useEffect, useRef } from 'react';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

const VoiceChat = ({ socket, boardId, user, activeUsers, isVoiceChatOpen, setIsVoiceChatOpen }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [peers, setPeers] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const localVideoRef = useRef();
  const peerRefs = useRef(new Map());
  const streamRef = useRef();

  useEffect(() => {
    if (!socket || !isVoiceChatOpen) return;

    // Request microphone access
    navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: false 
    }).then(stream => {
      setLocalStream(stream);
      streamRef.current = stream;
      
      // Join voice chat room
      socket.emit('join-voice-chat', { boardId });
    }).catch(err => {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone. Please check permissions.');
    });

    // Socket event listeners
    socket.on('voice-chat-joined', handleVoiceChatJoined);
    socket.on('user-joined-voice', handleUserJoinedVoice);
    socket.on('user-left-voice', handleUserLeftVoice);
    socket.on('voice-signal', handleVoiceSignal);
    socket.on('voice-ice-candidate', handleVoiceIceCandidate);
    socket.on('user-speaking', handleUserSpeaking);
    socket.on('user-stopped-speaking', handleUserStoppedSpeaking);

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      socket.emit('leave-voice-chat', { boardId });
      socket.off('voice-chat-joined');
      socket.off('user-joined-voice');
      socket.off('user-left-voice');
      socket.off('voice-signal');
      socket.off('voice-ice-candidate');
      socket.off('user-speaking');
      socket.off('user-stopped-speaking');
    };
  }, [socket, boardId, isVoiceChatOpen]);

  const handleVoiceChatJoined = (data) => {
    console.log('Joined voice chat:', data);
    setIsInCall(true);
    
    // Connect to existing peers
    data.peers.forEach(peerData => {
      createPeer(peerData.userId, peerData.signal);
    });
  };

  const handleUserJoinedVoice = (data) => {
    console.log('User joined voice chat:', data);
    createPeer(data.userId);
  };

  const handleUserLeftVoice = (data) => {
    console.log('User left voice chat:', data);
    removePeer(data.userId);
  };

  const createPeer = (userId, signal = null) => {
    if (!streamRef.current) return;

    const Peer = require('simple-peer');
    const peer = new Peer({
      initiator: !signal,
      trickle: false,
      stream: streamRef.current
    });

    peer.on('signal', (signal) => {
      socket.emit('voice-signal', { 
        boardId, 
        userId, 
        signal 
      });
    });

    peer.on('stream', (remoteStream) => {
      // Create audio element for remote stream
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.volume = isDeafened ? 0 : 1;
      
      // Store reference
      peerRefs.current.set(userId, { peer, audio });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      removePeer(userId);
    });

    if (signal) {
      peer.signal(signal);
    }

    setPeers(prev => new Map(prev.set(userId, peer)));
  };

  const removePeer = (userId) => {
    const peerData = peerRefs.current.get(userId);
    if (peerData) {
      peerData.peer.destroy();
      peerData.audio.remove();
      peerRefs.current.delete(userId);
    }
    
    setPeers(prev => {
      const newPeers = new Map(prev);
      newPeers.delete(userId);
      return newPeers;
    });
  };

  const handleVoiceSignal = (data) => {
    const peer = peers.get(data.userId);
    if (peer) {
      peer.signal(data.signal);
    }
  };

  const handleVoiceIceCandidate = (data) => {
    const peer = peers.get(data.userId);
    if (peer) {
      peer.signal(data.candidate);
    }
  };

  const handleUserSpeaking = (data) => {
    setSpeakingUsers(prev => new Set(prev.add(data.userId)));
  };

  const handleUserStoppedSpeaking = (data) => {
    setSpeakingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
    
    // Update volume for all remote streams
    peerRefs.current.forEach(({ audio }) => {
      audio.volume = isDeafened ? 1 : 0;
    });
  };

  const leaveVoiceChat = () => {
    setIsInCall(false);
    setIsVoiceChatOpen(false);
    
    // Cleanup all peers
    peerRefs.current.forEach(({ peer, audio }) => {
      peer.destroy();
      audio.remove();
    });
    peerRefs.current.clear();
    setPeers(new Map());
    
    // Stop local stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    socket.emit('leave-voice-chat', { boardId });
  };

  const getActiveVoiceUsers = () => {
    return activeUsers.filter(user => 
      peers.has(user.id) || user.id === user?.id
    );
  };

  return (
    <div className={`fixed left-4 bottom-4 z-10 transition-all duration-300 ease-in-out ${
      isVoiceChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 min-w-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <PhoneIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Voice Chat</h3>
              <p className="text-xs text-gray-500">
                {getActiveVoiceUsers().length} participant{getActiveVoiceUsers().length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsVoiceChatOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <PhoneXMarkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Participants */}
        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {getActiveVoiceUsers().map(participant => (
            <div 
              key={participant.id} 
              className={`flex items-center space-x-2 p-2 rounded-lg ${
                speakingUsers.has(participant.id) 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 flex-1">
                {participant.name}
                {participant.id === user?.id && ' (You)'}
              </span>
              {speakingUsers.has(participant.id) && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="iconLg"
            onClick={toggleMute}
            className="flex-shrink-0"
          >
            <div className="relative">
              <MicrophoneIcon className="w-5 h-5" />
              {isMuted && (
                <NoSymbolIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
              )}
            </div>
          </Button>

          <Button
            variant={isDeafened ? "destructive" : "default"}
            size="iconLg"
            onClick={toggleDeafen}
            className="flex-shrink-0"
          >
            {isDeafened ? (
              <SpeakerXMarkIcon className="w-5 h-5" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="iconLg"
            onClick={leaveVoiceChat}
            className="flex-shrink-0"
          >
            <PhoneXMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Status */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {isMuted ? 'Microphone muted' : 'Microphone active'}
            {isDeafened && ' • Audio disabled'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 