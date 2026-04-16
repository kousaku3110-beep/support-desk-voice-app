'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CallRecord {
  id: number;
  caller: string;
  receiver: string;
  startTime: string;
  duration: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');

    if (!name || !role) {
      router.push('/');
      return;
    }

    setUserName(name);
    setUserRole(role);
    loadCallHistory();
  }, [router]);

  const loadCallHistory = () => {
    const stored = localStorage.getItem('callHistory');
    if (stored) {
      setCalls(JSON.parse(stored));
    }
  };

  const handleStartCall = () => {
    if (userRole === 'staff') {
      setInCall(true);
      router.push('/call');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>ダッシュボード</h1>
        <div>
          <span style={{ marginRight: '20px' }}>ログイン: <strong>{userName}</strong></span>
          <button onClick={handleLogout} style={{ backgroundColor: '#6c757d' }}>ログアウト</button>
        </div>
      </div>

      {userRole === 'staff' && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleStartCall} style={{ padding: '15px 30px', fontSize: '16px' }}>
            📞 発信する
          </button>
        </div>
      )}

      <h2>通話履歴</h2>
      {calls.length === 0 ? (
        <p>通話履歴はありません</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>発信者</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>受信者</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>開始時刻</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>通話時間（秒）</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{call.caller}</td>
                <td style={{ padding: '10px' }}>{call.receiver}</td>
                <td style={{ padding: '10px' }}>{new Date(call.startTime).toLocaleString('ja-JP')}</td>
                <td style={{ padding: '10px' }}>{call.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
