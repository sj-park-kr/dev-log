# dev-log 작업 안내

Claude와 Codex의 공통 진입점이다. 작업에 해당하는 문서를 먼저 읽는다. 세부 규칙은 `docs/`에서만 관리한다.

| 작업·상황 | 읽을 문서 |
|---|---|
| 코드·문서 변경 전 | [작업 원칙](docs/rules/00-working-principles.md) |
| 작업 시작, 브랜치 확인, 커밋 | [브랜치와 커밋](docs/rules/10-git-workflow.md) |
| 새 글 작성·기존 글 수정 (동화책 형식) | [블로그 정체성](docs/rules/01-blog-identity.md), [글 구성](docs/rules/03-article-structure.md), [페이지 문장](docs/rules/04-slides-writing.md) |
| 글 파일·시리즈 생성, 메타데이터 수정 | [시리즈와 파일 구조](docs/rules/02-series-files.md) |
| 그림 생성·수정 | [SVG 규칙](docs/rules/05-svg.md) |
| 움직임 추가·수정 (위젯은 만들지 않음) | [애니메이션 규칙](docs/rules/06-animation.md) |
| 기술적 주장·날짜·버전·기본값 작성 | [사실 확인](docs/rules/07-fact-checking.md) |
| 작성자 질문 추가·수정 | [작성자 질문](docs/rules/09-author-questions.md) |
| 글 작성·수정 완료 (양식 검토 → 초보자 페르소나 검토, 둘 다 서브에이전트 필수), 검증·게시 준비 | [검토 규칙](docs/rules/08-review.md) |
| 새 글을 만들 때 함께 진행: 쇼츠 제작, 음성 검증, 썸네일, 유튜브 공개, 글에 영상 붙이기 | [영상 제작과 유튜브 업로드](docs/rules/12-youtube-video.md) |
| 서브에이전트를 띄울 때 (글 작성 Opus, 자료 조사·검토 Sonnet) | [작업별 모델](docs/rules/11-agent-models.md) |
| 매일 자동으로 새 글 작성 | [자동화 프롬프트와 설정](docs/daily-writing-prompt.md) |
| 문체·설명 방식 판단, 과거 피드백 확인 | [세션 기반 수정 성향](docs/writing-feedback.md) |

기준 예시는 [Kafka 1편](_posts/kafka/2026-11-15-why-kafka.md), 작성 틀은 [lesson-template.md](_drafts/lesson-template.md)다. 다른 글은 아직 예전 형식이라 구조를 따라 하지 않는다.
