'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Daily from '@daily-co/daily-js';

export default function CallPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callState, setCallState] = useState<string>('connecting');
  const [error, setError] = useState<string>('');
  const dailyCallRef = useRef<any>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');

    if (!name || !role) {
      router.push('/');
      return;
    }

    setUserName(name);
    setUserRole(role);
    initializeCall();

    return () => {
      if (dailyCallRef.current) {
        dailyCallRef.current.leave();
      }
    };
  }, [router]);

  const initializeCall = async () => {
    try {
      const callObject = Daily.createCallObject({
        videoSource: true,
        audioSource: true,
      });

      dailyCallRef.current = callObject;

      // イベントリスナー設定
      callObject
        .on('joined-meeting', handleJoinedMeeting)
        .on('left-meeting', handleLeftMeeting)
        .on('error', handleError);

      // 部屋に参加
      const roomUrl = `https://bishamon-support.daily.co/support-desk-${Date.now()}`;
      
      await callObject.join({
        url: roomUrl,
        videoSource: { width: { ideal: 640 }, height: { ideal: 480 } },
        audioSource: true,
      });

      setIsCallActive(true);
      setCallState('connected');
    } catch (err: any) {
      setError(`通話初期化エラー: ${err.message}`);
      setCallState('error');
    }
  };

  const handleJoinedMeeting = () => {
    setCallState('connected');
    setIsCallActive(true);
  };

  const handleLeftMeeting = () => {
    setIsCallActive(false);
    setCallState('disconnected');
  };

  const handleError = (error: any) => {
    console.error('Daily.co エラー:', error);
    setError(`エラー: ${error.message}`);
  };

  useEffect(() => {
    if (!isCallActive) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallActive]);

  const handleEndCall = async () => {
    try {
      if (dailyCallRef.current) {
        await dailyCallRef.current.leave();
      }

      setIsCallActive(false);

      // 通話履歴を保存
      const callRecord = {
        id: Date.now(),
        caller: userRole === 'staff' ? userName : '受信担当者',
        receiver: userRole === 'staff' ? '受信担当者' : userName,
        startTime: new Date().toISOString(),
        duration: callDuration,
      };

      const stored = localStorage.getItem('callHistory');
      const history = stored ? JSON.parse(stored) : [];
      history.push(callRecord);
      localStorage.setItem('callHistory', JSON.stringify(history));

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('通話終了エラー:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      padding: '20px',
    }}>
      <h1>通話中</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#dc3545', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <p style={{ fontSize: '24px', marginTop: '20px' }}>
        ユーザー: <strong>{userName}</strong>
      </p>

      <div ref={videoRef} style={{
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        backgroundColor: '#000',
        borderRadius: '10px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ opacity: 0.5 }}>ビデオプレビュー</span>
      </div>

      <p style={{ fontSize: '32px', marginTop: '30px', fontWeight: 'bold', color: '#00ff00' }}>
        {formatTime(callDuration)}
      </p>

      <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
        状態: <strong>{callState === 'connected' ? '接続中' : '接続中...'}</strong>
      </p>

      <div style={{ marginTop: '50px', display: 'flex', gap: '20px' }}>
        <button
          onClick={handleEndCall}
          disabled={!isCallActive}
          style={{
            padding: '20px 40px',
            fontSize: '18px',
            backgroundColor: isCallActive ? '#dc3545' : '#ccc',
            color: 'white',
            cursor: isCallActive ? 'pointer' : 'not-allowed',
          }}
        >
          ☎️ 通話を切断
        </button>
      </div>

      <p style={{ marginTop: '40px', opacity: 0.7 }}>
        {userRole === 'staff' ? '営業スタッフ' : '受信担当者'} として接続中
      </p>
    </div>
  );
}
