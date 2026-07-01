// 股票数据 API 调用（通过 Next.js API Route 代理，避免 CORS）

export async function getMarketIndices() {
  try {
    const res = await fetch("/api/stocks?type=indices");
    const data = await res.json();
    return (data.data?.diff || []).map((item: any) => ({
      code: item.f12,
      name: item.f14,
      price: item.f2,
      changePct: item.f3,
    }));
  } catch (e) {
    console.error("获取指数行情失败:", e);
    return [];
  }
}

export async function searchStocks(keyword: string) {
  try {

    const url = "/api/stocks?type=search&keyword=" + encodeURIComponent(keyword);
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.QueryResult?.[0]?.InstrumentList || [];
    return items.map((item: any) => ({
      code: item.Code,
      name: item.ShortName,
      market: item.Market,
    }));
  } catch (e) {
    console.error("搜索股票失败:", e);
    return [];
  }
}

export async function getStockQuote(code: string) {
  try {
    const url = "/api/stocks?type=quote&code=" + code;
    const res = await fetch(url);
    const data = await res.json();
    const raw = data.data?.data;
    if (!raw) return null;
    return {
      code: raw.f12,
      name: raw.f14,
      price: raw.f2,
      changePct: raw.f3,
      change: raw.f4,
      volume: raw.f5,
      amount: raw.f6,
      open: raw.f7,
      high: raw.f8,
      low: raw.f9,
      prevClose: raw.f10,
      turnoverRate: raw.f25,
      pe: raw.f19,
      marketCap: raw.f17,
      circMarketCap: raw.f18,
    };
  } catch (e) {
    console.error("获取行情失败:", e);
    return null;
  }
}
