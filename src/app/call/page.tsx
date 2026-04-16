'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CallPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');

    if (!name || !role) {
      router.push('/');
      return;
    }

    setUserName(name);
    setUserRole(role);
  }, [router]);

  useEffect(() => {
    if (!isCallActive) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallActive]);

  const handleEndCall = () => {
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
      <p style={{ fontSize: '24px', marginTop: '20px' }}>
        ユーザー: <strong>{userName}</strong>
      </p>
      <p style={{ fontSize: '32px', marginTop: '30px', fontWeight: 'bold', color: '#00ff00' }}>
        {formatTime(callDuration)}
      </p>

      <div style={{ marginTop: '50px', display: 'flex', gap: '20px' }}>
        <button
          onClick={handleEndCall}
          style={{
            padding: '20px 40px',
            fontSize: '18px',
            backgroundColor: '#dc3545',
            color: 'white',
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
