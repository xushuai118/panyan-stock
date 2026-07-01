'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStockQuote } from '@/lib/stock-api';
import { supabase } from '@/lib/supabase';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string || '';

  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    const fetchData = async () => {
      setLoading(true);
      const data = await getStockQuote(code);
      if (data) {
        setStock(data);
      } else {
        setError('获取股票数据失败');
      }
      setLoading(false);
    };
    fetchData();
  }, [code]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-page flex items-center justify-center">
        <p className="text-content-3">加载中...</p>
      </main>
    );
  }

  if (error || !stock) {
    return (
      <main className="min-h-screen bg-bg-page">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 mb-4">{error || '获取数据失败'}</p>
          <button onClick={() => router.push('/')} className="btn-primary">返回首页</button>
        </div>
      </main>
    );
  }

  const addToWatchlist = async () => {
    if (!stock) return;
    const { error } = await supabase.from('watchlists').insert({
      stock_code: stock.code,
      stock_name: stock.name,
    });
    if (error) {
      alert('添加失败：' + error.message);
    } else {
      alert('已添加到自选股');
    }
  };

  const changeColor = stock.changePct >= 0 ? 'text-up' : 'text-down';
  const changeSign = stock.changePct >= 0 ? '+' : '';

  return (
    <main className="min-h-screen bg-bg-page">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => router.back()} className="text-content-2 hover:text-primary mb-4 inline-block">
          返回
        </button>

        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-content-1">
                {stock.name} <span className="text-content-3 text-base font-normal">{'('}{stock.code}{')'}</span>
                <button onClick={addToWatchlist} className="ml-3 text-sm text-blue-600 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50">+ 自选</button>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-content-1">{stock.price}</p>
              <p className={changeColor + ' text-lg font-semibold'}>
                {changeSign}{stock.changePct}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-card p-4 text-center">
            <p className="text-xs text-content-3 mb-1">开盘</p>
            <p className="font-medium">{stock.open || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 text-center">
            <p className="text-xs text-content-3 mb-1">最高</p>
            <p className="font-medium">{stock.high || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 text-center">
            <p className="text-xs text-content-3 mb-1">最低</p>
            <p className="font-medium">{stock.low || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 text-center">
            <p className="text-xs text-content-3 mb-1">成交量</p>
            <p className="font-medium">{stock.volume ? Math.round(stock.volume / 100) + '手' : '-'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-content-1 mb-4">财务指标</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-content-3 mb-1">PE</p>
              <p className="font-medium">{stock.pe || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-content-3 mb-1">总市值（亿）</p>
              <p className="font-medium">{stock.marketCap ? Math.round(stock.marketCap / 10000) : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}