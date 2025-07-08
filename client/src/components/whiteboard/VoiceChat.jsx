import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline';

const JITSI_DOMAIN = 'meet.jit.si';

const VoiceChat = ({ boardId }) => {
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  // Generate a unique room name per board, fallback to a default
  const roomName = boardId ? `WhiteboardVoiceRoom_${boardId}` : 'WhiteboardVoiceRoomDemo123';

  useEffect(() => {
    if (!isVoiceChatOpen) return;

    // Dynamically load the Jitsi Meet API script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = startConference;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      startConference();
    }

    function startConference() {
      if (apiRef.current) return; // Prevent multiple instances

      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: 350,
        height: 200,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          disableSimulcast: true,
          prejoinPageEnabled: false,
          startAudioOnly: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'hangup'
          ],
          FILM_STRIP_MAX_HEIGHT: 0,
        },
        userInfo: {
          displayName: 'Whiteboard User'
        }
      });

      // Only allow audio
      apiRef.current.executeCommand('toggleVideo');

      // Listen for hangup
      apiRef.current.addListener('readyToClose', () => {
        setIsVoiceChatOpen(false);
      });
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [isVoiceChatOpen, roomName]);

  return (
    <div>
      {!isVoiceChatOpen && (
        <Button
          variant="default"
          size="iconLg"
          onClick={() => setIsVoiceChatOpen(true)}
          className="fixed left-8 bottom-8 z-50 shadow-xl bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-full hover:scale-105 transition-transform"
        >
          <PhoneIcon className="w-8 h-8" />
        </Button>
      )}
      {isVoiceChatOpen && (
        <>
          <Button
            variant="destructive"
            size="iconLg"
            onClick={() => setIsVoiceChatOpen(false)}
            className="fixed left-[380px] bottom-8 z-50 shadow-xl rounded-full hover:scale-105 transition-transform"
          >
            <PhoneXMarkIcon className="w-8 h-8" />
          </Button>
          <div
            ref={jitsiContainerRef}
            className="fixed left-8 bottom-32 z-50 rounded-2xl shadow-2xl bg-white"
            style={{ width: 350, height: 200, overflow: 'hidden' }}
          />
        </>
      )}
    </div>
  );
};

export default VoiceChat; 