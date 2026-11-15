## 2. 시리즈와 파일 구조
- 순서대로 쌓는 일기가 아니라 **주제별 시리즈**로 쓴다.
- 시리즈는 `_data/series.yml`에 등록한다(id, title, emoji, color, description). 새 시리즈라면 여기부터 추가한다.
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
  ```
- 이전 편/다음 편 링크는 `_layouts/post.html`이 자동으로 붙인다. 본문에 직접 쓰지 않는다.
- 스타일은 `assets/css/style.css` 하나에 모은다. 색은 테마 변수(`--ink`, `--surface`, `--line`, `--muted`, `--hl`, `--bad`, `--good` …)만 쓴다. 다크 모드 때문이다.

