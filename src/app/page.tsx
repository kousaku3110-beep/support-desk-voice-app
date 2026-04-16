'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const staffNames = [
  '営業太郎',
  '営業花子',
  '営業次郎',
  '営業美咲',
  '営業健太',
  '営業由美',
  '営業拓也',
  '営業優子',
  '営業翔太',
  '営業麻衣',
];

const receiverName = '受信担当者';

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = (name: string) => {
    setSelectedUser(name);
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userRole', name === receiverName ? 'receiver' : 'staff');
    router.push('/dashboard');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>サポートデスク音声通話システム</h1>
      <p>ユーザーを選択してください</p>

      <h2>営業スタッフ</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {staffNames.map((name) => (
          <button
            key={name}
            onClick={() => handleLogin(name)}
            style={{
              padding: '15px',
              fontSize: '14px',
              backgroundColor: selectedUser === name ? '#28a745' : '#007bff',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <h2>受信担当者</h2>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => handleLogin(receiverName)}
          style={{
            padding: '20px 40px',
            fontSize: '16px',
            backgroundColor: selectedUser === receiverName ? '#28a745' : '#dc3545',
          }}
        >
          {receiverName}
        </button>
      </div>
    </div>
  );
}
