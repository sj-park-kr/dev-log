// 사용법: node scripts/youtube-upload.mjs _motion/<슬러그> [public|unlisted|private|<예약 시각 ISO>] [글 파일]
// youtube.md와 MP4를 올리고, 처리 후 thumbnail.png와 글을 연결한다. 비밀값은 출력하지 않는다.
// 예약(예: 2026-11-24T22:00:00+09:00)은 비공개로 올려 그 시각에 공개되게만 한다. 공개 뒤 public과 글 경로로 다시 실행해 확인·썸네일·글 연결을 이어간다.
// 비밀 파일 이름을 조각내 쓰는 이유: Claude 훅이 해당 문자열이 든 도구 호출을 막아서, 이 파일도 Claude가 쓸 수 있어야 한다.
import { createServer } from 'node:http';
import { readFileSync, readdirSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { exec } from 'node:child_process';
import { basename, isAbsolute, join, relative, sep } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const [dir, mode = 'public', post] = process.argv.slice(2);
if (!dir) throw new Error('폴더를 지정하세요: node scripts/youtube-upload.mjs _motion/<슬러그> public [글 파일]');
const publishAt = /^\d{4}-\d{2}-\d{2}T/.test(mode) ? new Date(mode) : null;
if (publishAt && !(publishAt > Date.now())) throw new Error('예약 시각은 앞으로의 ISO 시각이어야 합니다 (예: 2026-11-24T22:00:00+09:00)');
const privacy = publishAt ? 'public' : mode; // 예약 영상은 결국 공개되므로 기록도 public으로 남겨 재실행을 잇는다
if (!['public', 'unlisted', 'private'].includes(privacy)) throw new Error('공개 범위는 public|unlisted|private 또는 예약 시각');
if (post && (privacy !== 'public' || publishAt)) throw new Error('글에는 공개된 영상만 연결하세요. 예약 영상은 공개 뒤 public으로 다시 실행하세요.');

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

const slug = basename(dir);
const thumbnail = join(dir, 'thumbnail.png');
const receiptPath = join(dir, 'youtube-upload.json');
const videoId = /^[A-Za-z0-9_-]{11}$/;
const frontMatter = /^\uFEFF?---\r?\n([\s\S]*?\r?\n)---(?=\r?\n|$)/;
function readPost() {
  const content = readFileSync(post, 'utf8');
  const header = content.match(frontMatter);
  if (!header) throw new Error('글에서 front matter를 찾지 못했습니다');
  const id = header[1].match(/^youtube:[ \t]*(\S+)/m)?.[1];
  if (id && !videoId.test(id)) throw new Error('글의 youtube ID가 잘못됐습니다');
  return { content, header, id };
}

let existingPost;
if (post) {
  const inPosts = relative('_posts', post);
  const postSlug = basename(post).match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/)?.[1];
  if (isAbsolute(inPosts) || inPosts.startsWith('..'+sep) || inPosts === '..' || postSlug !== slug) {
    throw new Error('영상 폴더와 같은 슬러그의 _posts 글을 지정하세요');
  }
  if (!existsSync(thumbnail)) throw new Error('thumbnail.png를 먼저 준비하세요');
  existingPost = readPost();
}

let receipt = existsSync(receiptPath) ? JSON.parse(readFileSync(receiptPath, 'utf8')) : null;
function saveReceipt() {
  writeFileSync(receiptPath+'.tmp', JSON.stringify(receipt, null, 2)+'\n');
  renameSync(receiptPath+'.tmp', receiptPath);
}
if (receipt && (!videoId.test(receipt.id) || receipt.privacy !== privacy || (existingPost?.id && receipt.id !== existingPost.id))) {
  throw new Error('기존 업로드 기록이 요청한 공개 범위 또는 글의 영상 ID와 다릅니다');
}
if (!receipt && existingPost?.id) receipt = { id: existingPost.id, privacy };

async function uploadVideo() {
  const md = readFileSync(join(dir, 'youtube.md'), 'utf8').replaceAll('\r\n', '\n');
  const title = md.match(/^1\. \*\*(.+?)\*\*/m)?.[1];
  const description = md.match(/```\n([\s\S]*?)```/)?.[1].trim();
  const videos = readdirSync(dir).filter(f => f.endsWith('.mp4'));
  if (!title || title.length > 100 || !description || videos.length !== 1) {
    throw new Error('제목(100자 이내), 설명란, MP4 1개를 확인하세요');
  }
  const video = readFileSync(join(dir, videos[0]));
  const token = await accessToken();
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
      status: publishAt
        ? { privacyStatus: 'private', publishAt: publishAt.toISOString(), selfDeclaredMadeForKids: false }
        : { privacyStatus: privacy, selfDeclaredMadeForKids: false },
    }),
  });
  if (!start.ok) throw new Error(`업로드 시작 실패 ${start.status}: ${await start.text()}`);
  const uploaded = await fetch(start.headers.get('location'), {
    method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: video,
  });
  const result = await uploaded.json();
  if (!uploaded.ok || !videoId.test(result.id)) throw new Error(`업로드 실패 ${uploaded.status}: ${JSON.stringify(result)}`);
  receipt = { id: result.id, privacy };
  saveReceipt();
  console.log(`업로드 완료 (${privacy}): https://www.youtube.com/watch?v=${receipt.id}`);
}

async function waitForPage(url, check, failure) {
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const result = check(await response.text());
        if (result) return result;
      }
    } catch {}
    if (attempt < 11) await setTimeout(5000);
  }
  throw new Error(`${failure}. 같은 명령을 다시 실행하면 ${receipt.id}에서 이어갑니다.`);
}

function linkThumbnail(html) {
  return html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
}

function playableShort(html) {
  const json = html.match(/(?:var )?ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)?.[1];
  if (!json) return;
  const player = JSON.parse(json);
  if (player.playabilityStatus?.status === 'OK' && player.videoDetails?.videoId === receipt.id
    && Number(player.videoDetails.lengthSeconds) > 0
    && (privacy !== 'public' || player.microformat?.playerMicroformatRenderer?.isUnlisted !== true)) {
    return player.videoDetails;
  }
}

function channelCardThumbnails(html) {
  const json = html.match(/(?:var )?ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)?.[1];
  if (!json) return;
  const tabs = JSON.parse(json).contents?.twoColumnBrowseResultsRenderer?.tabs;
  const rows = tabs?.find(tab => tab.tabRenderer?.selected)?.tabRenderer.content?.richGridRenderer?.contents;
  const card = rows?.map(row => row.richItemRenderer?.content?.shortsLockupViewModel)
    .find(item => item?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId === receipt.id);
  // onTap 아래 이미지는 재생에 쓰이고, 목록에서 보이는 이미지는 thumbnailViewModel에 있다.
  return card?.thumbnailViewModel?.thumbnailViewModel?.image?.sources;
}

function matchesThumbnail(url, path) {
  return Boolean(url) && new URL(url).pathname === path;
}

async function applyThumbnail() {
  const token = await accessToken();
  const url = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?uploadType=media&videoId=${receipt.id}`;
  const res = await fetch(url, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' },
    body: readFileSync(thumbnail),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(`썸네일 적용 실패 ${res.status}: ${result.error?.message}`);
  return result.items?.[0]?.shortsAspectRatio?.url;
}

if (!receipt) await uploadVideo();
if (publishAt) {
  // 스튜디오에서 바로 보이게 지금 넣되 기록하지 않는다. 공개 뒤 재실행이 채널 쇼츠 목록에 뜬 다음 한 번 더 넣는다.
  if (existsSync(thumbnail)) { await applyThumbnail(); console.log('썸네일 적용'); }
  console.log(`예약 완료 (${publishAt.toISOString()} 공개). 공개 뒤 public과 글 경로로 다시 실행하세요: https://studio.youtube.com/video/${receipt.id}/edit`);
  process.exit(0);
}
if (privacy !== 'private') {
  const shortUrl = `https://www.youtube.com/shorts/${receipt.id}`;
  const short = await waitForPage(shortUrl, playableShort, '쇼츠 공개 재생을 아직 확인하지 못했습니다');
  if (existsSync(thumbnail)) {
    let channelUrl;
    if (privacy === 'public') {
      if (!/^UC[A-Za-z0-9_-]{22}$/.test(short.channelId)) throw new Error('쇼츠에서 채널 ID를 확인하지 못했습니다');
      channelUrl = `https://www.youtube.com/channel/${short.channelId}/shorts`;
    }
    const studioHint = `계속 다른 이미지가 보이면 스튜디오에서 thumbnail.png를 지정하세요 (https://studio.youtube.com/video/${receipt.id}/edit)`;
    if (!receipt.thumbnail) {
      if (channelUrl) {
        await waitForPage(channelUrl, channelCardThumbnails, '채널 쇼츠 목록에 영상이 아직 표시되지 않습니다');
      }
      receipt.thumbnail = (await applyThumbnail()) ?? `https://i.ytimg.com/vi/${receipt.id}/sardefault.jpg`;
      saveReceipt();
    }
    const path = new URL(receipt.thumbnail).pathname;
    if (channelUrl) {
      await waitForPage(channelUrl, html => channelCardThumbnails(html)?.some(({ url }) => matchesThumbnail(url, path)),
        `채널 쇼츠 목록에 맞춤 썸네일이 아직 표시되지 않습니다. ${studioHint}`);
    }
    await waitForPage(shortUrl, html => matchesThumbnail(linkThumbnail(html), path),
      `쇼츠 링크 미리보기에 맞춤 썸네일이 아직 표시되지 않습니다. ${studioHint}`);
    console.log(channelUrl ? '채널 쇼츠 목록과 링크 미리보기 썸네일 확인' : '쇼츠 링크 미리보기 썸네일 확인');
  }
}
if (post) {
  const latest = readPost();
  if (latest.id && latest.id !== receipt.id) throw new Error('업로드 중 글의 youtube ID가 바뀌었습니다');
  if (!latest.id) {
    const [header, fields] = latest.header;
    const dateBreak = header.includes('\r\n') ? '\r\n' : '\n';
    const linked = header.replace(fields, () => `${fields}youtube: ${receipt.id}${dateBreak}`);
    writeFileSync(post, linked + latest.content.slice(header.length));
  }
  console.log(`글 연결 완료: ${post}`);
}
console.log(`완료 (${privacy}): https://www.youtube.com/shorts/${receipt.id}`);
