import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Button } from '../ui/Button';
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const DAILY_ROOM_URL = 'https://durvesh-whiteboard.daily.co/whiteboard-room';

const VoiceChat = ({ socket, boardId, user, activeUsers, isVoiceChatOpen, setIsVoiceChatOpen }) => {
  const callFrameRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('not-connected');

  useEffect(() => {
    if (!isVoiceChatOpen) return;
    
    console.log('🎤 Starting Daily.co voice chat...');
    toast.info('Connecting to voice chat...');
    
    // Create the call frame
    callFrameRef.current = DailyIframe.createFrame({
      showLeaveButton: true,
      showFullscreenButton: false,
      showLocalVideo: false,
      showParticipantsBar: true,
      activeSpeakerMode: true,
      iframeStyle: {
        position: 'fixed',
        width: '350px',
        height: '200px',
        bottom: '20px',
        left: '20px',
        borderRadius: '16px',
        zIndex: 1000,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      },
    });
    
    // Set up event listeners
    callFrameRef.current
      .on('joining-meeting', () => {
        console.log('🎤 Joining meeting...');
        setConnectionState('connecting');
      })
      .on('joined-meeting', (e) => {
        console.log('🎤 Joined meeting successfully!', e);
        setIsJoined(true);
        setConnectionState('connected');
        toast.success('Connected to voice chat!');
      })
      .on('participant-joined', (e) => {
        console.log('👤 Participant joined:', e.participant);
        setParticipants(prev => [...prev.filter(p => p.session_id !== e.participant.session_id), e.participant]);
      })
      .on('participant-left', (e) => {
        console.log('👤 Participant left:', e.participant);
        setParticipants(prev => prev.filter(p => p.session_id !== e.participant.session_id));
      })
      .on('left-meeting', () => {
        console.log('🎤 Left meeting');
        setIsJoined(false);
        setConnectionState('not-connected');
        setParticipants([]);
        setIsVoiceChatOpen(false);
        toast.info('Left voice chat');
      })
      .on('error', (e) => {
        console.error('🎤 Daily.co error:', e);
        toast.error('Voice chat error: ' + e.message);
        setConnectionState('error');
      });
    
    // Join the room with audio only
    callFrameRef.current.join({ 
      url: DAILY_ROOM_URL, 
      video: false, 
      audio: true,
      userName: user?.name || 'Anonymous'
    });
    
    // Cleanup on unmount or close
    return () => {
      if (callFrameRef.current) {
        console.log('🎤 Cleaning up Daily.co frame');
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      setIsJoined(false);
      setConnectionState('not-connected');
      setParticipants([]);
    };
  }, [isVoiceChatOpen, user?.name]);

  const toggleMute = async () => {
    if (callFrameRef.current && isJoined) {
      try {
        await callFrameRef.current.setLocalAudio(!isMuted);
        setIsMuted(!isMuted);
        console.log('🎤 Microphone', isMuted ? 'unmuted' : 'muted');
      } catch (error) {
        console.error('Error toggling mute:', error);
        toast.error('Failed to toggle microphone');
      }
    }
  };

  const leaveCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    } else {
      setIsVoiceChatOpen(false);
    }
  };

  return (
    <div>
      {!isVoiceChatOpen && (
        <Button
          variant="default"
          size="iconLg"
          onClick={() => setIsVoiceChatOpen(true)}
          className="fixed left-4 bottom-4 z-10 shadow-lg bg-gradient-to-br from-green-500 to-blue-600 text-white"
        >
          <PhoneIcon className="w-6 h-6" />
        </Button>
      )}
      
      {/* The Daily iframe is managed by DailyIframe and appears when open */}
      {isVoiceChatOpen && (
        <div className="fixed left-4 bottom-4 z-20 flex gap-2">
          {/* Mute/Unmute Button */}
          {isJoined && (
            <Button
              variant={isMuted ? "destructive" : "default"}
              size="iconLg"
              onClick={toggleMute}
              className="shadow-lg"
              title={isMuted ? "Unmute" : "Mute"}
            >
              <MicrophoneIcon className={`w-6 h-6 ${isMuted ? 'text-red-500' : ''}`} />
            </Button>
          )}
          
          {/* Leave Call Button */}
          <Button
            variant="destructive"
            size="iconLg"
            onClick={leaveCall}
            className="shadow-lg"
            title="Leave Call"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
          </Button>
          
          {/* Status Indicator */}
          <div className="bg-white rounded-lg shadow-lg px-3 py-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionState === 'connected' ? 'bg-green-500' : 
              connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              connectionState === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connectionState === 'connected' ? `${participants.length + 1} in call` :
               connectionState === 'connecting' ? 'Connecting...' :
               connectionState === 'error' ? 'Error' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat; 