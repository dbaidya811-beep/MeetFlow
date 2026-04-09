'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

function getInitialNameFromUrl() {
  if (typeof window === 'undefined') return 'Anonymous';
  const params = new URLSearchParams(window.location.search);
  return params.get('name') || 'Anonymous';
}

export default function Meeting() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;
  
  const [localStream, setLocalStream] = useState(null);
  const [userName, setUserName] = useState('Anonymous');
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting');
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [localUserName, setLocalUserName] = useState('Anonymous');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const timerRef = useRef(null);
  const clientIdRef = useRef(Math.random().toString(36).substring(2, 15));
  const localStreamRef = useRef(null);
  const userNameRef = useRef('Anonymous');

  const addStreamToPeerConnection = (pc, stream) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }
  };

  const createPeerConnection = (peerId) => {
    if (peerConnectionsRef.current[peerId]) {
      peerConnectionsRef.current[peerId].close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === 1) {
        console.log('Sending ICE candidate to', peerId);
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          to: peerId,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('Received track from', peerId, event.streams[0]);
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerId, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.log('ICE failed for', peerId, ', attempting restart');
        pc.restartIce();
      }
    };

    addStreamToPeerConnection(pc, localStreamRef.current);

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallStatus('connected');

      Object.values(peerConnectionsRef.current).forEach(pc => {
        addStreamToPeerConnection(pc, stream);
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus('failed');
    }
  };

  const createOffer = async (peerId) => {
    if (!localStreamRef.current) {
      console.log('Waiting for local stream before creating offer to', peerId);
      setTimeout(() => createOffer(peerId), 1000);
      return;
    }
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('Sending offer to', peerId);
    wsRef.current?.send(JSON.stringify({
      type: 'offer',
      to: peerId,
      sdp: offer
    }));
  };

  const connectWebSocket = () => {
    const wsUrl = `ws://${window.location.hostname}:8080`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsLoading(false);
      initializeMedia();
      ws.send(JSON.stringify({
        type: 'join',
        roomId,
        clientId: clientIdRef.current,
        name: userNameRef.current
      }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed, reconnecting in 3s...');
      setTimeout(connectWebSocket, 3000);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data.type, 'from:', data.from);

      switch (data.type) {
        case 'joined':
          {
            const validParticipants = (data.participants || []).filter(p => p && p.id && typeof p.id === 'string');
            setParticipants(validParticipants.map(p => ({ id: p.id, name: p.name || 'Anonymous' })));
            for (const peer of validParticipants) {
              createOffer(peer.id);
            }
          }
          break;

        case 'user-joined':
          if (data.clientId && typeof data.clientId === 'string') {
            console.log('User joined:', data.clientId);
            setParticipants(prev => {
              if (prev.find(p => p.id === data.clientId)) return prev;
              return [...prev, { id: data.clientId, name: data.name || 'Anonymous' }];
            });
            setNotification({ type: 'joined', name: data.name || 'Anonymous' });
            setTimeout(() => setNotification(null), 2000);
            createOffer(data.clientId);
          }
          break;

        case 'user-left':
          if (data.clientId) {
            const leftParticipant = participants.find(p => p.id === data.clientId);
            setParticipants(prev => prev.filter(p => p.id !== data.clientId));
            if (leftParticipant) {
              setNotification({ type: 'left', name: leftParticipant.name });
              setTimeout(() => setNotification(null), 2000);
            }
            if (peerConnectionsRef.current[data.clientId]) {
              peerConnectionsRef.current[data.clientId].close();
              delete peerConnectionsRef.current[data.clientId];
            }
            setRemoteStreams(prev => {
              const next = { ...prev };
              delete next[data.clientId];
              return next;
            });
          }
          break;

        case 'offer':
          {
            const pc = createPeerConnection(data.from);
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({
              type: 'answer',
              to: data.from,
              sdp: answer
            }));
          }
          break;

        case 'answer':
          {
            const pc = peerConnectionsRef.current[data.from];
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
          }
          break;

        case 'ice-candidate':
          {
            const pc = peerConnectionsRef.current[data.from];
            if (pc && data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          }
          break;

        case 'chat':
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            text: data.message,
            sender: data.from,
            time: data.time
          }]);
          break;

        case 'user-name-updated':
          setParticipants(prev => prev.map(p => 
            p.id === data.clientId ? { ...p, name: data.newName } : p
          ));
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      setTimeout(connectWebSocket, 3000);
    };
  };

  useEffect(() => {
    const initialName = getInitialNameFromUrl();
    if (initialName !== 'Anonymous') {
      setUserName(initialName);
      setLocalUserName(initialName);
      userNameRef.current = initialName;
    } else {
      setShowNameModal(true);
    }
    connectWebSocket();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: 'leave' }));
        wsRef.current.close();
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      setScreenStream(stream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && stream.getVideoTracks()[0]) {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      setIsScreenSharing(true);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    if (localStreamRef.current?.getVideoTracks()[0]) {
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
        }
      });
    }

    setScreenStream(null);
    setIsScreenSharing(false);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'leave' }));
      wsRef.current.close();
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    router.push('/');
  };

  const sendMessage = () => {
    if (newMessage.trim() && wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        message: newMessage
      }));
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        sender: 'You',
        time: new Date().toLocaleTimeString()
      }]);
      setNewMessage('');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNameSubmit = () => {
    if (pendingName.trim()) {
      const name = pendingName.trim();
      setUserName(name);
      setLocalUserName(name);
      userNameRef.current = name;
      setShowNameModal(false);
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update-name',
          name: name
        }));
      }
    }
  };

return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400 text-lg">Connecting to meeting...</p>
          </div>
        </div>
      )}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          {notification.type === 'joined' ? (
            <>
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-white text-sm">{notification.name} joined</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                </svg>
              </div>
              <span className="text-white text-sm">{notification.name} left</span>
            </>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 px-2 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'} ${callStatus === 'connected' && 'animate-pulse'}`}></div>
                <span className="text-zinc-100 font-medium text-lg">Meeting Room</span>
                <span className="text-zinc-500 text-sm font-mono">#{roomId}</span>
              </div>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center gap-2 text-zinc-400 text-sm bg-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{participants.length + 1}</span>
              </button>
              <div className="text-zinc-400 font-mono text-lg bg-zinc-900 px-4 py-1.5 rounded-lg ml-auto">{formatDuration(callDuration)}</div>
            </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-4 overflow-y-auto pb-4">
            <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 aspect-video">
              {isVideoOff ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{localUserName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-4">
                  <span className="text-white text-sm font-medium">{localUserName} {isMuted && '(Muted)'}</span>
                </div>
            </div>

            {isScreenSharing && (
              <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 aspect-video">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-4">
                  <span className="text-white text-sm font-medium">Screen Share</span>
                </div>
              </div>
            )}

            {(participants || []).map((participant) => (
              <div key={participant.id} className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 aspect-video">
                {remoteStreams[participant.id] ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={el => {
                      if (el && remoteStreams[participant.id]) {
                        el.srcObject = remoteStreams[participant.id];
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">
                        <span className="text-3xl font-bold text-white">{participant.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <p className="text-zinc-500 text-sm mt-3">Connecting...</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-4">
                  <span className="text-white text-sm font-medium">{(participant?.name || 'Anonymous')}</span>
                </div>
              </div>
            ))}

            {participants.length === 0 && !isScreenSharing && (
              <div className="bg-zinc-900/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-800 aspect-video">
                <div className="text-center">
                  <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-500">Waiting for others to join...</p>
                  <p className="text-zinc-600 text-sm mt-2 font-mono">{'/meeting/' + roomId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showParticipants && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={() => setShowParticipants(false)}>
            <div className="bg-zinc-900 w-full max-w-sm h-[500px] rounded-2xl border border-zinc-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-zinc-100 font-semibold">Participants ({participants.length + 1})</h2>
                <button onClick={() => setShowParticipants(false)} className="text-zinc-500 hover:text-zinc-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-medium">{localUserName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-100 font-medium">{localUserName}</p>
                    <p className="text-zinc-500 text-xs">You</p>
                  </div>
                </div>
                {(participants || []).map(participant => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white font-medium">{(participant?.name || 'Anonymous').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-100 font-medium">{participant?.name || 'Anonymous'}</p>
                      <p className="text-zinc-500 text-xs">Connected</p>
                    </div>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-zinc-600 text-center text-sm mt-4">No other participants yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" onClick={() => setShowChat(false)}>
            <div className="bg-zinc-900 w-full max-w-md h-[500px] rounded-2xl border border-zinc-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-zinc-100 font-semibold">Chat</h2>
                <button onClick={() => setShowChat(false)} className="text-zinc-500 hover:text-zinc-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-zinc-600 text-center text-sm">No messages yet</p>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className="bg-zinc-800/50 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-emerald-400 text-sm font-medium">{msg.sender}</span>
                        <span className="text-zinc-600 text-xs">{msg.time}</span>
                      </div>
                      <p className="text-zinc-300 text-sm">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap max-w-4xl mx-auto">
          <button
            onClick={toggleMute}
            className={`h-12 px-5 rounded-xl font-medium transition flex items-center gap-2 ${
              isMuted 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={toggleVideo}
            className={`h-12 px-5 rounded-xl font-medium transition flex items-center gap-2 ${
              isVideoOff 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {isVideoOff ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>

          <button
            onClick={toggleScreenShare}
            className={`h-12 px-5 rounded-xl font-medium transition flex items-center gap-2 ${
              isScreenSharing 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {isScreenSharing ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1m-6.25 1h6.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25h-6.5a2.25 2.25 0 00-2.25 2.25v8.5a2.25 2.25 0 002.25 2.25z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1m-6.25 1h6.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25h-6.5a2.25 2.25 0 00-2.25 2.25v8.5a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
            <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`h-12 px-5 rounded-xl font-medium transition flex items-center gap-2 ${
              showChat 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat</span>
          </button>

          <button
            onClick={endCall}
            className="h-12 px-6 rounded-xl font-medium transition flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            <span>End Call</span>
          </button>
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-sm border border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Join Meeting</h2>
            <p className="text-zinc-500 mb-6">Enter your name to join the meeting</p>
            <input
              type="text"
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-zinc-800 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && pendingName.trim() && handleNameSubmit()}
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              disabled={!pendingName.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition"
            >
              Join Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}