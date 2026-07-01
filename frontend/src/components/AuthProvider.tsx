'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
        return;
      }
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('匿名登录失败:', error.message);
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <p className="text-content-3">加载中...</p>
      </div>
    );
  }

  return <>{children}</>;
}