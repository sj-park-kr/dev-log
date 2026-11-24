# dev-log 작업 안내

Claude와 Codex의 공통 진입점이다. 세부 규칙은 `docs/`에서만 관리한다.

## 문서 안내

1. 작업을 시작하거나 커밋할 때 [브랜치와 커밋](docs/rules/10-git-workflow.md)을 읽는다.
2. 코드나 문서를 바꾸기 전에 [작업 원칙](docs/rules/00-working-principles.md)을 읽는다.
3. 아래 표에서 지금 맡은 작업에 해당하는 문서를 읽는다.

| 작업·상황 | 읽을 문서 |
|---|---|
| 다음에 쓸 주제를 고르거나 후보를 남길 때 | [주제 후보 목록](docs/todo.md) |
| 새 글 작성·기존 글 수정 (동화책 형식) | [블로그 정체성](docs/rules/01-blog-identity.md), [글 구성](docs/rules/03-article-structure.md), [페이지 문장](docs/rules/04-slides-writing.md) |
| 글 파일·시리즈 생성, 메타데이터 수정 | [시리즈와 파일 구조](docs/rules/02-series-files.md) |
| 그림 생성·수정 | [SVG 규칙](docs/rules/05-svg.md) |
| 커서·시리즈 로고를 추가·교체하거나 아이콘 출처를 확인할 때 | [커서 아이콘 출처](docs/cursor-icons.md) |
| 움직임 추가·수정 (위젯은 만들지 않음) | [애니메이션 규칙](docs/rules/06-animation.md) |
| 기술적 주장·날짜·버전·기본값 작성 | [사실 확인](docs/rules/07-fact-checking.md) |
| 작성자 질문 추가·수정 | [작성자 질문](docs/rules/09-author-questions.md) |
| 글 작성·수정 완료 (양식 검토 → 초보자 페르소나 검토, 둘 다 서브에이전트 필수), 검증·게시 준비 | [검토 규칙](docs/rules/08-review.md) |
| 새 글을 만들 때 함께 진행하는 쇼츠 제작, 음성·썸네일 확인, 유튜브 공개·예약, 글에 영상 연결 | [영상 제작과 유튜브 업로드](docs/rules/12-youtube-video.md) |
| Claude·Codex에서 작성·조사·검토 모델을 정할 때 | [작업별 모델](docs/rules/11-agent-models.md) |
| 매일 자동으로 새 글 작성 | [자동화 프롬프트와 설정](docs/daily-writing-prompt.md) |
| 문체·설명 방식 판단, 과거 피드백 확인 | [세션 기반 수정 성향](docs/writing-feedback.md) |

새 글을 시작할 때는 [작성 템플릿](_drafts/lesson-template.md)을 사용한다. 기존 글을 동화책 형식으로 옮기거나 완성된 글의 구성을 확인할 때는 [Kafka 1편](_posts/kafka/2026-11-15-why-kafka.md)을 기준으로 삼는다.
