'use client';

import { useState, useEffect } from 'react';
import { getMarketIndices, searchStocks, getStockQuote } from '@/lib/stock-api';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [indices, setIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'screen'>('search');

  const [minPe, setMinPe] = useState('');
  const [maxPe, setMaxPe] = useState('');
  const [minMarketCap, setMinMarketCap] = useState('');
  const [industry, setIndustry] = useState('');
  const [screenResults, setScreenResults] = useState<any[]>([]);

  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => { getMarketIndices().then(setIndices); }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearchResults(await searchStocks(keyword));
    setLoading(false);
  };

  const handleScreen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stocks?type=screen');
      const json = await res.json();
      const list = json.data?.diff || [];

      const minPeNum = minPe ? Number(minPe) : -Infinity;
      const maxPeNum = maxPe ? Number(maxPe) : Infinity;
      const minCapNum = minMarketCap ? Number(minMarketCap) * 10000 : 0;
      const keyword = industry.trim().toLowerCase();

      const filtered = list.filter((item: any) => {
        const pe = item.f19;
        const cap = item.f17;
        const name = (item.f14 || '').toLowerCase();

        if (pe == null || pe === '-' || Number(pe) <= 0) return false;
        if (Number(pe) < minPeNum || Number(pe) > maxPeNum) return false;
        if (cap == null || Number(cap) < minCapNum) return false;
        if (keyword && !name.includes(keyword)) return false;
        return true;
      });

      setScreenResults(
        filtered.map((item: any) => ({
          code: item.f12,
          name: item.f14,
          price: item.f2,
          changePct: item.f3,
          pe: item.f19,
          marketCap: item.f17 ? Math.round(item.f17 / 10000) : 0,
        }))
      );
    } catch (e) {
      console.error('筛选失败?', e);
      alert('筛选请求失败，请稍后重试');
    }
    setLoading(false);
  };

  const openStockDetail = async (stock: any) => {
    setSelectedStock(stock);
    setQuoteLoading(true);
    setQuote(await getStockQuote(stock.code));
    setQuoteLoading(false);
  };

  const closeModal = () => {
    setSelectedStock(null);
    setQuote(null);
  };

  const addToWatchlist = async (stock: any) => {
    const { error } = await supabase.from('watchlists').insert({
      stock_code: stock.code,
      stock_name: stock.name,
    });
    if (error) { alert('添加失败：' + error.message); }
    else { alert('已添加到自选股'); }
  };

  const getChangeClass = (val: number | string) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    return n >= 0 ? 'text-up' : 'text-down';
  };

  return (
    <main className="min-h-screen bg-bg-page">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {indices.length > 0 && (
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex gap-6 overflow-x-auto">
              {indices.map((idx) => (
                <div key={idx.code} className="flex-shrink-0">
                  <p className="text-xs text-content-3">{idx.name}</p>
                  <p className={'text-lg font-bold ' + getChangeClass(Number(idx.changePct))}>{idx.price}</p>
                  <p className={'text-xs ' + getChangeClass(Number(idx.changePct))}>
                    {Number(idx.changePct) >= 0 ? '+' : ''}{idx.changePct}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button className={activeTab === 'search' ? 'btn-primary' : 'bg-white border border-border rounded-lg px-4 py-2 text-content-2'} onClick={() => setActiveTab('search')}>股票搜索</button>
          <button className={activeTab === 'screen' ? 'btn-primary' : 'bg-white border border-border rounded-lg px-4 py-2 text-content-2'} onClick={() => setActiveTab('screen')}>选股筛选</button>
        </div>
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">搜索股票</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入股票代码或名称" className="flex-1 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <button onClick={handleSearch} disabled={loading} className="btn-primary disabled:opacity-50">{loading ? '搜索中...' : '搜索'}</button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <div key={stock.code} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50">
                    <div><span className="font-medium">{stock.name}</span><span className="text-content-3 text-sm ml-2">{stock.code}</span></div>
                    <div className="flex gap-2">
                      <button onClick={() => openStockDetail(stock)} className="text-primary text-sm">查看详情</button>
                      <button onClick={() => addToWatchlist(stock)} className="text-ai-primary text-sm">+ 自选</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'screen' && (
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">选股筛选</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><label className="text-sm text-content-2">PE 最小值</label><input type="number" value={minPe} onChange={(e) => setMinPe(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 mt-1" /></div>
              <div><label className="text-sm text-content-2">PE 最大值</label><input type="number" value={maxPe} onChange={(e) => setMaxPe(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 mt-1" /></div>
              <div><label className="text-sm text-content-2">市值最小（亿）</label><input type="number" value={minMarketCap} onChange={(e) => setMinMarketCap(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 mt-1" /></div>
              <div><label className="text-sm text-content-2">行业</label><input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 mt-1" placeholder="如：白酒" /></div>
            </div>
            <button onClick={handleScreen} disabled={loading} className="btn-primary disabled:opacity-50">{loading ? '筛选中...' : '开始筛选'}</button>
            {screenResults.length > 0 && (
              <div className="mt-6 space-y-2">
                {screenResults.map((stock) => (
                  <div key={stock.code} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openStockDetail(stock)}>
                    <div><span className="font-medium">{stock.name}</span><span className="text-content-3 text-sm ml-2">{stock.code}</span></div>
                    <div className="text-right"><p className="font-mono">{stock.price}</p><p className={'text-sm ' + getChangeClass(stock.changePct)}>{stock.changePct >= 0 ? '+' : ''}{stock.changePct}%</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-card max-w-2xl w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedStock.name}</h3>
                <p className="text-content-3 text-sm">{selectedStock.code}</p>
              </div>
              <button onClick={closeModal} className="text-content-3 hover:text-content-1 text-2xl">&times;</button>
            </div>
            {quoteLoading ? (
              <p className="text-content-2">加载中...</p>
            ) : quote ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-content-2">最新价</span>
                  <span className={'font-mono font-bold ' + getChangeClass(quote.changePct)}>{quote.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">涨跌幅</span>
                  <span className={getChangeClass(quote.changePct)}>
                    {Number(quote.changePct) >= 0 ? '+' : ''}{quote.changePct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">涨跌额</span>
                  <span className={getChangeClass(quote.change)}>{quote.change}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">开盘价</span>
                  <span className="font-mono">{quote.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">最高价</span>
                  <span className="font-mono">{quote.high}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">最低价</span>
                  <span className="font-mono">{quote.low}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">昨收</span>
                  <span className="font-mono">{quote.prevClose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">成交量</span>
                  <span className="font-mono">{quote.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">成交额</span>
                  <span className="font-mono">{quote.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">市盈率</span>
                  <span className="font-mono">{quote.pe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-2">总市值</span>
                  <span className="font-mono">{quote.marketCap}</span>
                </div>
              </div>
            ) : (
              <p className="text-content-2">暂无行情数据</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
