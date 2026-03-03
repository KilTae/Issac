const BASE_URL = 'https://openapi.ls-sec.co.kr:8080';
const APP_KEY = '';
const APP_SECRET = '';

let accessToken: string | null = null;

export const getAccessToken = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      appkey: APP_KEY,
      appsecretkey: APP_SECRET,
      scope: 'oob',
    }).toString(),
  });

  const data = await response.json();
  accessToken = data.access_token;
  return data.access_token;
};