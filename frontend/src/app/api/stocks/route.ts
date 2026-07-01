import { NextRequest, NextResponse } from 'next/server';

const EASTMONEY_BASE = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
const EASTMONEY_SEARCH = 'https://searchadapter.eastmoney.com/api/suggest/get';

// 指数代码列表
const INDEX_CODES = '1.000001,1.000016,1.000300,1.000688,0.399001,0.399006';

// 模拟国内浏览器请求头
const CN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://quote.eastmoney.com/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, { headers: CN_HEADERS, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
    } catch (e) {
      clearTimeout(timeout);
      if (i === retries) throw e;
    }
  }
  throw new Error('fetch failed');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'screen') {
      const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f12,f14,f2,f3,f19,f17,f20`;
      const res = await fetchWithRetry(url);
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }
    if (type === 'indices') {
      const url = `${EASTMONEY_BASE}?fltt=2&fields=f2,f3,f4,f12,f14&secids=${INDEX_CODES}`;
      const res = await fetchWithRetry(url);
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }

    if (type === 'search') {
      const keyword = searchParams.get('keyword') || '';
      const url = `${EASTMONEY_SEARCH}?input=${encodeURIComponent(keyword)}&type=14`;
      const res = await fetchWithRetry(url);
      const data = await res.json();
      return NextResponse.json({ code: 0, ...data });
    }

    if (type === 'quote') {
      const code = searchParams.get('code') || '';
      const prefix = code.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?fltt=2&secid=${prefix}.${code}&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f17,f18,f25`;
      const res = await fetchWithRetry(url);
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }

    return NextResponse.json({ code: -1, message: '未知类型' });
  } catch (e) {
    console.error('API错误:', e);
    return NextResponse.json({ code: -1, message: '请求失败' }, { status: 500 });
  }
}
