const BASE_URL = 'https://openapi.ls-sec.co.kr:8080';
const APP_KEY = 'PSZakdw3rPLwpIAyxZfiNNnm4Iv5xLZ8CIYN';
const APP_SECRET = 'zzaGHg6eGO6z9SmJnhFRO5JBRwhZYGuL';

let accessToken: string | null = null;
export const getAccessToken = async (): Promise<string> => {
  const body = [
    'grant_type=client_credentials',
    `appkey=${encodeURIComponent(APP_KEY)}`,
    `appsecretkey=${encodeURIComponent(APP_SECRET)}`,
    'scope=oob',
  ].join('&');

  const response = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();
  accessToken = data.access_token;
  return data.access_token;
};




// 토큰 자동 확인 헬퍼
const ensureToken = async () => {
  if (!accessToken) await getAccessToken();
};

// 공통 POST 헬퍼
const postApi = async (path: string, trCd: string, body: object) => {
  await ensureToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      tr_cd: trCd,
      tr_cont: 'N',
      tr_cont_key: '0',
      mac_address: '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.rsp_msg ?? `${trCd} 조회 실패`);
  return data;
};

// ============================
// 계좌 잔고 조회 (t0424)
// ============================
export const getAccountBalance = async () => {
  return postApi('/stock/accno', 't0424', {
    t0424InBlock: {
      prcgb: '1',  // 1: 평균단가, 2: BEP단가
      chegb: '0',  // 0: 전체, 1: 체결, 2: 미체결
      dangb: '0',  // 0: 전체, 1: 단일가
      charge: '1', // 0: 제비용 미포함, 1: 포함
      cts_expcode: '',
    },
  });
};

// ============================
// 계좌 거래내역 조회 (CDPCQ04700)
// ============================
export const getAccountTrades = async (startDt: string, endDt: string) => {
  return postApi('/stock/accno', 'CDPCQ04700', {
    CDPCQ04700InBlock1: {
      RecCnt: 1,
      QryTp: '0',
      QrySrtDt: startDt, // 예: '20260301'
      QryEndDt: endDt,   // 예: '20260303'
      SrtNo: 0,
      PdptnCode: '01',
      IsuLgclssCode: '01',
      IsuNo: '',
    },
  });
};

// ============================
// 상승/하락 상위 종목 조회 (t1441)
// ============================
export const getHighStockItems = async (
  gubun2: '0' | '1' | '2' = '0' // 0: 상승률, 1: 하락률, 2: 보합
) => {
  return postApi('/stock/high-item', 't1441', {
    t1441InBlock: {
      gubun1: '0',    // 0: 전체, 1: 코스피, 2: 코스닥
      gubun2,
      gubun3: '0',    // 0: 당일, 1: 전일
      jc_num: 0,
      sprice: 0,
      eprice: 999999,
      volume: 0,
      idx: 0,
      jc_num2: 0,
      exchgubun: 'K', // K: KRX, N: NXT, U: 통합
    },
  });
};

// ============================
// 주식 현재가 조회 (t1102)
// ============================
export const getStockPrice = async (shcode: string) => {
  return postApi('/stock/market-data', 't1102', {
    t1102InBlock: { shcode },
  });
};

// ============================
// 업종 현재가 조회 (t1511)
// ============================
export const getSectorPrice = async (upcode: string) => {
  return postApi('/stock/sector', 't1511', {
    t1511InBlock: { upcode },
  });
};