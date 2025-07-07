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
import Peer from 'simple-peer';

const VoiceChat = ({ socket, boardId, user, activeUsers, isVoiceChatOpen, setIsVoiceChatOpen }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [peers, setPeers] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [voiceUsers, setVoiceUsers] = useState(new Set());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const localVideoRef = useRef();
  const peerRefs = useRef(new Map());
  const streamRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();

  useEffect(() => {
    if (!socket || !isVoiceChatOpen) return;

    // Request microphone access
    console.log('Requesting microphone access...');
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }, 
      video: false 
    }).then(stream => {
      console.log('Microphone access granted');
      console.log('Local stream tracks:', stream.getTracks().length);
      console.log('Audio tracks:', stream.getAudioTracks().length);
      
      setLocalStream(stream);
      streamRef.current = stream;
      
      // Test local audio
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('Audio track settings:', audioTrack.getSettings());
        console.log('Audio track enabled:', audioTrack.enabled);
      }
      
      // Set up voice activity detection
      setupVoiceActivityDetection(stream);
      
      // Join voice chat room
      console.log('Joining voice chat room for board:', boardId);
      socket.emit('join-voice-chat', { boardId });
      setConnectionStatus('connecting');
    }).catch(err => {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else {
        toast.error('Could not access microphone. Please check permissions and try again.');
      }
    });

    // Socket event listeners
    socket.on('voice-chat-joined', (data) => {
      console.log('[SOCKET] voice-chat-joined', data);
      handleVoiceChatJoined(data);
    });
    socket.on('user-joined-voice', (data) => {
      console.log('[SOCKET] user-joined-voice', data);
      handleUserJoinedVoice(data);
    });
    socket.on('user-left-voice', (data) => {
      console.log('[SOCKET] user-left-voice', data);
      handleUserLeftVoice(data);
    });
    socket.on('voice-signal', (data) => {
      console.log('[SOCKET] voice-signal', data);
      handleVoiceSignal(data);
    });
    socket.on('voice-ice-candidate', (data) => {
      console.log('[SOCKET] voice-ice-candidate', data);
      handleVoiceIceCandidate(data);
    });

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Cleanup all peers
      peerRefs.current.forEach(({ peer, audio }, peerUserId) => {
        if (peer) {
          console.log(`[CLEANUP] Destroying peer for user ${peerUserId}`);
          peer.destroy();
        }
        if (audio && audio.parentNode) {
          console.log(`[CLEANUP] Removing audio element for user ${peerUserId}`);
          audio.parentNode.removeChild(audio);
        }
      });
      peerRefs.current.clear();
      
      socket.emit('leave-voice-chat', { boardId });
      socket.off('voice-chat-joined');
      socket.off('user-joined-voice');
      socket.off('user-left-voice');
      socket.off('voice-signal');
      socket.off('voice-ice-candidate');
    };
  }, [socket, boardId, isVoiceChatOpen]);

  const setupVoiceActivityDetection = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start monitoring voice activity
      monitorVoiceActivity();
    } catch (error) {
      console.error('Error setting up voice activity detection:', error);
    }
  };

  const monitorVoiceActivity = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkAudio = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      const isSpeaking = average > 20 && !isMuted; // Threshold for speaking detection
      
      if (isSpeaking && !speakingUsers.has(user?.id)) {
        setSpeakingUsers(prev => new Set(prev.add(user?.id)));
      } else if (!isSpeaking && speakingUsers.has(user?.id)) {
        setSpeakingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user?.id);
          return newSet;
        });
      }
      
      requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  };

  const handleVoiceChatJoined = (data) => {
    console.log('Joined voice chat:', data);
    setIsInCall(true);
    setConnectionStatus('connected');
    
    // Create peers for existing users - we are the initiator for existing users
    if (data.peers && data.peers.length > 0) {
      data.peers.forEach(peerData => {
        if (peerData.userId !== user.id) {
          console.log('Creating peer for existing user:', peerData.userId);
          createPeer(peerData.userId, true); // We initiate to existing users
        } else {
          console.log('Skipping self-connection for user:', peerData.userId);
        }
      });
    } else {
      console.log('No existing peers in voice chat');
    }
  };

  const handleUserJoinedVoice = (data) => {
    console.log('User joined voice chat:', data);
    setVoiceUsers(prev => new Set(prev.add(data.userId)));
    // Don't create peer here - the new user will initiate to us
  };

  const handleUserLeftVoice = (data) => {
    console.log('User left voice chat:', data);
    setVoiceUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
    setSpeakingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
    removePeer(data.userId);
  };

  const createPeer = (userId, initiator = true) => {
    if (!streamRef.current) {
      console.error('No local stream available');
      return;
    }

    if (peers.has(userId)) {
      console.log('Peer already exists for user:', userId);
      return;
    }

    console.log(`Creating peer for user ${userId}, initiator: ${initiator}`);

    const peer = new Peer({
      initiator,
      trickle: true, // Enable trickle ICE for better connectivity
      stream: streamRef.current,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      }
    });

    peer.on('signal', (signal) => {
      console.log(`[PEER] signal event for user ${userId}:`, signal);
      if (signal.type === 'offer' || signal.type === 'answer') {
        console.log(`[PEER] Sending SDP (${signal.type}) to user ${userId}`);
        socket.emit('voice-signal', { 
          boardId, 
          userId, 
          signal 
        });
      } else {
        // ICE candidate
        console.log(`[PEER] Sending ICE candidate to user ${userId}`);
        socket.emit('voice-ice-candidate', { 
          boardId, 
          userId, 
          candidate: signal 
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log(`[PEER] Received remote stream from user: ${userId}`);
      console.log('[PEER] Remote stream tracks:', remoteStream.getTracks().length);
      console.log('[PEER] Audio tracks:', remoteStream.getAudioTracks().length);
      
      // Create audio element for remote stream
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.volume = isDeafened ? 0 : 1;
      audio.style.display = 'none';
      audio.controls = false;
      console.log(`[AUDIO] Creating audio element for user ${userId}`);
      
      // Try to play immediately and handle any errors
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[AUDIO] Successfully playing audio from user: ${userId}`);
          })
          .catch(err => {
            console.error(`[AUDIO] Error playing remote audio for user ${userId}:`, err);
            // Try clicking to enable audio on user interaction
            const enableAudio = () => {
              audio.play().then(() => {
                console.log(`[AUDIO] Audio enabled after user interaction for user ${userId}`);
                document.removeEventListener('click', enableAudio);
              }).catch(console.error);
            };
            document.addEventListener('click', enableAudio, { once: true });
          });
      }
      
      // Add to document to ensure it plays
      document.body.appendChild(audio);
      
      // Store reference
      peerRefs.current.set(userId, { peer, audio });
      setVoiceUsers(prev => new Set(prev.add(userId)));
    });

    peer.on('connect', () => {
      console.log(`[PEER] Peer connected: ${userId}`);
      toast.success(`Connected to ${userId}`);
    });

    peer.on('data', (data) => {
      console.log(`[PEER] Received data from peer ${userId}:`, data);
    });

    peer.on('error', (err) => {
      console.error(`[PEER] Peer error with user ${userId}:`, err);
      toast.error(`Connection error with user ${userId}`);
      // Try to reconnect after a short delay
      setTimeout(() => {
        console.log(`[PEER] Attempting to reconnect to user: ${userId}`);
        removePeer(userId);
        createPeer(userId, true); // Try as initiator on reconnect
      }, 2000);
    });

    peer.on('close', () => {
      console.log(`[PEER] Peer connection closed: ${userId}`);
      removePeer(userId);
    });

    setPeers(prev => new Map(prev.set(userId, peer)));
    return peer;
  };

  const removePeer = (userId) => {
    console.log('Removing peer:', userId);
    
    const peerData = peerRefs.current.get(userId);
    if (peerData) {
      if (peerData.peer) {
        peerData.peer.destroy();
      }
      if (peerData.audio && peerData.audio.parentNode) {
        peerData.audio.parentNode.removeChild(peerData.audio);
      }
      peerRefs.current.delete(userId);
    }
    
    setPeers(prev => {
      const newPeers = new Map(prev);
      newPeers.delete(userId);
      return newPeers;
    });
    
    setVoiceUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleVoiceSignal = (data) => {
    console.log('[SIGNAL] handleVoiceSignal', data);
    let peer = peers.get(data.userId);
    
    if (!peer) {
      // If we don't have a peer yet, create one as non-initiator
      console.log('[SIGNAL] Creating new peer as non-initiator for:', data.userId);
      peer = createPeer(data.userId, false);
      
      // Wait a bit for peer to be ready, then signal
      if (peer && data.signal) {
        setTimeout(() => {
          try {
            console.log('[SIGNAL] Delayed peer.signal for', data.userId, data.signal);
            peer.signal(data.signal);
          } catch (error) {
            console.error('[SIGNAL] Error handling delayed signal:', error);
          }
        }, 100);
      }
    } else if (data.signal) {
      try {
        console.log('[SIGNAL] peer.signal for', data.userId, data.signal);
        peer.signal(data.signal);
      } catch (error) {
        console.error('[SIGNAL] Error handling signal:', error);
        // If signal fails, try recreating the peer
        console.log('[SIGNAL] Recreating peer due to signal error');
        removePeer(data.userId);
        peer = createPeer(data.userId, false);
        if (peer) {
          setTimeout(() => {
            try {
              console.log('[SIGNAL] Retry peer.signal for', data.userId, data.signal);
              peer.signal(data.signal);
            } catch (retryError) {
              console.error('[SIGNAL] Error handling signal on retry:', retryError);
            }
          }, 100);
        }
      }
    }
  };

  const handleVoiceIceCandidate = (data) => {
    console.log('[SIGNAL] handleVoiceIceCandidate', data);
    const peer = peers.get(data.userId);
    if (peer && data.candidate) {
      try {
        console.log('[SIGNAL] Adding ICE candidate to peer:', data.userId, data.candidate);
        peer.signal(data.candidate);
      } catch (error) {
        console.error('[SIGNAL] Error handling ICE candidate:', error);
      }
    } else {
      console.warn('[SIGNAL] No peer found for ICE candidate from user:', data.userId);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Update voice activity detection
        if (!audioTrack.enabled) {
          setSpeakingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(user?.id);
            return newSet;
          });
        }
      }
    }
  };

  const toggleDeafen = () => {
    const newDeafenState = !isDeafened;
    setIsDeafened(newDeafenState);
    
    // Update volume for all remote streams
    peerRefs.current.forEach(({ audio }) => {
      if (audio) {
        audio.volume = newDeafenState ? 0 : 1;
      }
    });
  };

  const leaveVoiceChat = () => {
    setIsInCall(false);
    setIsVoiceChatOpen(false);
    
    // Cleanup all peers
    peerRefs.current.forEach(({ peer, audio }) => {
      if (peer) peer.destroy();
      if (audio && audio.parentNode) audio.parentNode.removeChild(audio);
    });
    peerRefs.current.clear();
    setPeers(new Map());
    setVoiceUsers(new Set());
    setSpeakingUsers(new Set());
    
    // Stop local stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    socket.emit('leave-voice-chat', { boardId });
  };

  const getActiveVoiceUsers = () => {
    const currentVoiceUsers = Array.from(voiceUsers);
    // Add current user if in call
    if (isInCall && user?.id && !currentVoiceUsers.includes(user.id)) {
      currentVoiceUsers.push(user.id);
    }
    
    return activeUsers.filter(activeUser => 
      currentVoiceUsers.includes(activeUser.id) || activeUser.id === user?.id
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
          {/* Debug info */}
          <div className="mt-1 text-xs text-gray-400">
            Peers: {peers.size} | Voice Users: {voiceUsers.size}
          </div>
          {localStream && (
            <div className="text-xs text-green-500">
              Local stream: {localStream.getAudioTracks().length} audio tracks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 