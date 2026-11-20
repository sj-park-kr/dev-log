## 2. 시리즈와 파일 구조
- 순서대로 쌓는 일기가 아니라 **주제별 시리즈**로 쓴다.
- 시리즈는 `_data/series.yml`에 등록한다(id, title, emoji, logo, color, description). 새 시리즈라면 여기부터 추가한다.
- `logo`는 공식 로고 파일 경로(예: `/assets/cursors/docker.svg`)다. 있으면 목록과 글 상단의 시리즈 표시에 emoji 대신 쓰고, 없으면 emoji를 쓴다. 로고 파일을 새로 넣으면 공식 출처와 라이선스를 [cursor-icons.md](../cursor-icons.md)에 적는다.
- 글 오른쪽의 떠 있는 목차와 `1-1` 같은 번호는 `_layouts/post.html`과 CSS가 h2·h3에서 자동으로 만든다. 본문에 직접 쓰지 않는다.
- 글 파일은 `_posts/<시리즈id>/YYYY-MM-DD-영문-슬러그.md`에 둔다. 폴더는 정리용일 뿐이고, 어느 시리즈인지는 front matter가 정한다.
- front matter 필수 항목:
  ```yaml
  layout: post
  title: "OOO는 왜 생겼을까? (비유)로 이해하는 OOO"
  description: "검색 결과용 한 문장. 비유와 실제 동작에서 다루는 키워드"
  date: YYYY-MM-DD HH:MM:SS +0900   # 현재 시각보다 미래면 Jekyll이 글을 올리지 않는다
  series: <시리즈id>
  episode: <숫자, 따옴표 없이>
  summary: "글 상단과 목록에 보일 한 줄 요약"
  youtube: 영상ID   # 선택. 영상을 올린 뒤에만 넣는다. [영상 제작과 유튜브 업로드](12-youtube-video.md)
  ```
- 이전 편/다음 편 링크는 `_layouts/post.html`이 자동으로 붙인다. 본문에 직접 쓰지 않는다.
- 스타일은 `assets/css/style.css` 하나에 모은다. 색은 테마 변수(`--ink`, `--surface`, `--line`, `--muted`, `--hl`, `--bad`, `--good` …)만 쓴다. 다크 모드 때문이다.

