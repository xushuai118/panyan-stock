import { NextRequest, NextResponse } from 'next/server';

const EASTMONEY_BASE = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
const EASTMONEY_SEARCH = 'https://searchadapter.eastmoney.com/api/suggest/get';

// 指数代码列表
const INDEX_CODES = '1.000001,1.000016,1.000300,1.000688,0.399001,0.399006';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'screen') {
      // 获取 A 股列表（按成交额排序，一次拿 500 只）
      const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f12,f14,f2,f3,f19,f17,f20`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }
    if (type === 'indices') {
      // 获取指数行情
      const url = `${EASTMONEY_BASE}?fltt=2&fields=f2,f3,f4,f12,f14&secids=${INDEX_CODES}`;
      const res = await fetch(url, { next: { revalidate: 30 } });
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }

    if (type === 'search') {
      // 搜索股票
      const keyword = searchParams.get('keyword') || '';
      const url = `${EASTMONEY_SEARCH}?input=${encodeURIComponent(keyword)}&type=14`;
      const res = await fetch(url);
      const data = await res.json();
      return NextResponse.json({ code: 0, ...data });
    }

    if (type === 'quote') {
      // 获取个股行情
      const code = searchParams.get('code') || '';
      const prefix = code.startsWith('6') ? '1' : '0';
      const url = `https://push2.eastmoney.com/api/qt/stock/get?fltt=2&secid=${prefix}.${code}&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f17,f18,f25`;
      const res = await fetch(url, { next: { revalidate: 15 } });
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }

    return NextResponse.json({ code: -1, message: '未知类型' });
  } catch (e) {
    console.error('API错误:', e);
    return NextResponse.json({ code: -1, message: '请求失败' }, { status: 500 });
  }
}
