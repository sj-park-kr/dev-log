## 5. 그림 규칙 (인라인 SVG)
- 이미지 파일 대신 본문에 `<svg class="dg" viewBox="0 0 400 H" role="img" aria-label="그림 내용을 문장으로">`를 넣는다. 가로 400 기준으로 그려야 휴대폰에서도 글자가 읽힌다.
- 색은 직접 쓰지 않고 클래스로 지정한다.

  | 클래스 | 용도 |
  |---|---|
  | `box` | 기본 상자 |
  | `kafka` | 주인공·강조 상자(노란색) |
  | `bad` | 문제가 생긴 곳(빨간색) |
  | `new` | 새로 생긴 것(초록 점선) |
  | `line` / `line dash` | 연결선 / 점선 |
  | `mark` | 위치 표시 삼각형 |
  | `small` | 보조 글씨 |
  | `chip` | 작은 상자 안 글씨 |
  | `label` | 왼쪽 정렬 소제목 |
  | `alert` | 빨간 보조 글씨 |
  | `big` | 아이콘 아래 이름표(17px 굵게) |
  | `center` | `label`을 가운데 정렬로 바꿈(`class="label center"`) |
  | `ic` | 아이콘 선 스타일(`<use class="ic">`에 붙임) |

- 화살표 `<marker>`의 id는 글 전체에서 겹치지 않게 짓는다(예: `a1, a2…`). 비유와 실제 동작 그림을 합칠 때도 중복을 확인한다. marker의 `path`에는 fill을 직접 쓰지 않는다.
- 한글 글자 너비를 고려해 상자는 넉넉하게 그린다. 텍스트 도식(ASCII)은 쓰지 않는다.

### 아이콘으로 그리기
비유의 사물(냄비, 상자, 가게, 건물 등)은 글자만 든 상자 대신 아이콘으로 그린다. 직접 그리지 말고 [Lucide](https://lucide.dev)(ISC)에서 가져온다. 기준 예시는 `_posts/docker/2026-11-15-why-container.md`다.
- **스프라이트**: 글 맨 위(`<div class="lesson …">` 바로 안)에 숨긴 `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>…</defs></svg>`를 두고 `<symbol id="i-이름" viewBox="0 0 24 24">`로 글에 쓰는 아이콘만 정의한다. 빈 줄을 넣지 않는다.
- **가져오기**: `https://cdn.jsdelivr.net/npm/lucide-static@<버전>/icons/<이름>.svg`의 `<path>` 값을 한 `<symbol>`에 옮긴다. 버전을 정해 쓰고 `lucide-static`의 `latest`는 쓰지 않는다. 쓸 만한 이름이 없으면 24x24 칸에 같은 굵기로 직접 그리고 스프라이트 주석에 직접 그렸다고 밝힌다.
- **사용**: `<circle class="kafka" cx cy r/><use class="ic" href="#i-pot" x y width height/>`처럼 색 원(`kafka`·`bad`·`box`·`new`) 위에 얹는다. 큰 배지는 r 40~42에 아이콘 52, 중간은 r 28~36에 36~44, 작은 것은 r 17~20에 22~28을 쓴다. 아이콘 색은 `ic`가 정하므로 직접 지정하지 않는다.
- **색의 뜻**: 노랑(`kafka`)은 주인공·좋은 쪽, 빨강(`bad`)은 문제·달라진 쪽, `box`는 중립, 초록 점선(`new`)은 새로 생긴 것·보관한 것이다. 한 글에서 같은 뜻에 같은 색을 쓴다. 짝이 되는 둘(친구 주방과 우리 주방)은 같은 아이콘에 색만 다르게 한다.
- **글자**: 아이콘 아래에는 `big` 이름표나 `chip` 라벨 한두 마디만 쓴다. 아이콘만으로 뜻이 불분명하면 라벨을 꼭 붙인다. 설명하지 않는 장식용 아이콘과 이모지는 넣지 않는다.
- **묶기**: 관련된 여러 항목은 `<rect class="line" rx="12"/>` 카드 하나로 묶고 제목은 `class="label center"`로 카드 안 가운데에 둔다. 위아래를 점선으로 가르지 않는다. 좌우가 대칭인 그림의 제목은 가운데 정렬이고 좌우 열 제목(`label`)만 왼쪽 정렬이다.
- **라이선스**: Lucide의 ISC와 Feather의 MIT 전문은 `assets/icons/LICENSE-lucide.txt`에 있다. 다른 아이콘 세트를 쓰면 그 라이선스 전문도 같은 폴더에 넣는다.

