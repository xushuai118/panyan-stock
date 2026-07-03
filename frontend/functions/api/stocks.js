/**
 * EdgeOne Pages Function — 东方财富数据代理
 * 
 * 路由：/api/stocks?type=indices|search|screen|quote
 * 文件路径：functions/api/stocks.js
 * 运行时：Node.js (Pages Functions)
 */

const EASTMONEY_BASE = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
const EASTMONEY_CLIST = 'https://push2.eastmoney.com/api/qt/clist/get';
const EASTMONEY_SEARCH = 'https://searchadapter.eastmoney.com/api/suggest/get';
const EASTMONEY_STOCK = 'https://push2.eastmoney.com/api/qt/stock/get';
const INDEX_CODES = '1.000001,1.000016,1.000300,1.000688,0.399001,0.399006';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://quote.eastmoney.com/',
  'Accept': 'application/json, text/plain, */*',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  try {
    let apiUrl;
    
    switch (type) {
      case 'indices':
        apiUrl = `${EASTMONEY_BASE}?fltt=2&fields=f2,f3,f4,f12,f14&secids=${INDEX_CODES}`;
        break;
      case 'search':
        apiUrl = `${EASTMONEY_SEARCH}?input=${encodeURIComponent(url.searchParams.get('keyword') || '')}&type=14`;
        break;
      case 'screen':
        apiUrl = `${EASTMONEY_CLIST}?pn=1&pz=500&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f12,f14,f2,f3,f19,f17,f20`;
        break;
      case 'quote':
        const code = url.searchParams.get('code') || '';
        const prefix = code.startsWith('6') ? '1' : '0';
        apiUrl = `${EASTMONEY_STOCK}?fltt=2&secid=${prefix}.${code}&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f17,f18,f25`;
        break;
      default:
        return new Response(JSON.stringify({ code: -1, message: `Unknown type: ${type}` }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }

    const resp = await fetch(apiUrl, { headers: FETCH_HEADERS });
    if (!resp.ok) {
      throw new Error(`EastMoney responded with ${resp.status}`);
    }
    const data = await resp.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ code: -1, message: e.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
