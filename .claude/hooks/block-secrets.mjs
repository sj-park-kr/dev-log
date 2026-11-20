// PreToolUse 훅: OAuth 비밀 파일(client_secret*, youtube-token*)을 건드리는 도구 호출을 막는다.
let raw = '';
for await (const c of process.stdin) raw += c;
const { tool_name: tool, tool_input: input = {} } = JSON.parse(raw || '{}');
const text = JSON.stringify(input);

const secret = /client[_-]?secret|youtube[_-]?token|yt-oauth/i;
// shortcut: 셸 명령의 _motion 와일드카드/json 접근만 막는다. 변수로 조립한 경로는 못 잡는다.
const shellGlob = /_motion[\\/]+(\*|[^\s"']*\.json)/i;
const isShell = tool === 'Bash' || tool === 'PowerShell';

if (secret.test(text) || (isShell && shellGlob.test(text))) {
  console.error('차단됨: OAuth 비밀 파일은 Claude가 읽거나 건드릴 수 없습니다.');
  process.exit(2);
}
