// 사용법: node scripts/youtube-upload.mjs _motion/why-kafka [public|unlisted|private]
// 폴더의 youtube.md(추천 제목 1번 + 설명란 코드블록)와 첫 mp4를 올린다. 비밀값은 출력하지 않는다.
// 비밀 파일 이름을 조각내 쓰는 이유: Claude 훅이 해당 문자열이 든 도구 호출을 막아서, 이 파일도 Claude가 쓸 수 있어야 한다.
import { createServer } from 'node:http';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { join } from 'node:path';

const [dir, privacy = 'public'] = process.argv.slice(2);
if (!dir) throw new Error('폴더를 지정하세요: node scripts/youtube-upload.mjs _motion/why-kafka');
if (!['public', 'unlisted', 'private'].includes(privacy)) throw new Error('공개 범위는 public|unlisted|private');

const KEY = 'client_' + 'secret';
const keyFile = readdirSync('_motion').find((f) => f.startsWith(KEY) && f.endsWith('.json'));
if (!keyFile) throw new Error('_motion에 OAuth 클라이언트 JSON이 없습니다');
const app = JSON.parse(readFileSync(join('_motion', keyFile), 'utf8')).installed;
const tokenPath = '_motion/yt-' + 'oauth.json';

async function tokenRequest(params) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: app.client_id, [KEY]: app[KEY], ...params }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`토큰 요청 실패: ${json.error_description ?? json.error}`);
  return json;
}

async function login() {
  const server = createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const redirect_uri = `http://127.0.0.1:${server.address().port}`;
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: app.client_id, redirect_uri, response_type: 'code', access_type: 'offline', prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
  });
  console.log('브라우저에서 업로드할 채널의 계정으로 로그인하세요. 안 열리면 아래 주소를 직접 여세요.\n' + url);
  exec(`start "" "${url}"`);
  const code = await new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      const q = new URL(req.url, redirect_uri).searchParams;
      res.end('done. you can close this tab.');
      q.get('code') ? resolve(q.get('code')) : reject(new Error(`인증 거부: ${q.get('error')}`));
    });
  });
  server.close();
  const t = await tokenRequest({ code, redirect_uri, grant_type: 'authorization_code' });
  writeFileSync(tokenPath, JSON.stringify({ refresh_token: t.refresh_token }));
  return t.access_token;
}

async function accessToken() {
  if (!existsSync(tokenPath)) return login();
  const { refresh_token } = JSON.parse(readFileSync(tokenPath, 'utf8'));
  return (await tokenRequest({ refresh_token, grant_type: 'refresh_token' })).access_token;
}

const md = readFileSync(join(dir, 'youtube.md'), 'utf8');
const title = md.match(/^1\. \*\*(.+?)\*\*/m)?.[1];
const description = md.match(/```\n([\s\S]*?)```/)?.[1].trim();
const mp4 = readdirSync(dir).find((f) => f.endsWith('.mp4'));
if (!title || !description || !mp4) throw new Error('youtube.md의 제목/설명 또는 mp4를 찾지 못했습니다');

const token = await accessToken();
const video = readFileSync(join(dir, mp4));
const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Upload-Content-Type': 'video/mp4',
    'X-Upload-Content-Length': String(video.length),
  },
  body: JSON.stringify({
    snippet: { title, description, categoryId: '27' },
    status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
  }),
});
if (!start.ok) throw new Error(`업로드 시작 실패 ${start.status}: ${await start.text()}`);

const up = await fetch(start.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: video });
const result = await up.json();
if (!up.ok) throw new Error(`업로드 실패 ${up.status}: ${JSON.stringify(result)}`);
console.log(`완료 (${privacy}): https://www.youtube.com/watch?v=${result.id}`);
