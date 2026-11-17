# 커서 아이콘 출처

메뉴의 로고는 인기순(Stack Overflow·TIOBE 등 순위를 참고한 대략적 순서)으로 나열한다. 모든 로고는 각 프로젝트의 공식 사이트·공식 저장소 또는 공식 사이트에서 연결한 배포 서버에서 받는다. 로고 모음 사이트의 파일은 사용하지 않는다.

로고마다 여백이 달라 크기가 들쭉날쭉하므로, 각 SVG의 `viewBox`를 실제 그려진 영역(투명하지 않은 부분)에 맞춰 정사각형으로 잘라 긴 변이 32px을 거의 채우게 한다(약 4% 여백). 이미지 내용은 건드리지 않는다. 새 로고를 추가할 때도 같은 방식으로 맞춘다.

기본 커서 크기는 32×32이며(메뉴의 슬라이더로 24~64px 사이에서 바꿀 수 있고 `localStorage`에 저장한다) 원본의 비율·색상·투명도를 유지한다. 색상 필터, 밝기 보정, 반투명 효과, 배경 또는 테두리를 추가하지 않는다. PNG 배포본은 원본을 SVG의 data URL로 포함해 크기만 지정한다.

선택한 로고는 OS의 커서 이미지 대신 페이지의 32×32 이미지로 표시한다. 메뉴와 동일한 파일을 그대로 사용하며 포인터 위치를 따라 이동한다. 메뉴 위에서도 보이도록 수동 popover로 최상위에 배치하고 마우스 이벤트는 통과시킨다. 로고 표시 중에는 링크·버튼·드래그 영역을 포함한 페이지 전체에서 기본 커서를 숨긴다. 기본 화살표를 선택하거나 포인터가 창을 벗어나면 브라우저의 커서로 돌아온다. Python 원본의 `pt` 크기는 96/72 배율로 픽셀 영역에 환산한다.

| 로고 | 공식 출처 · 배포 파일 |
|---|---|
| VS Code | [브랜드 페이지](https://code.visualstudio.com/brand)의 [아이콘 ZIP](https://code.visualstudio.com/assets/branding/visual-studio-code-icons.zip), `vscode.svg` |
| Trino | [공식 사이트 SVG](https://trino.io/assets/images/trino-logo/trino-ko_tiny-alt.svg) |
| RabbitMQ | [상표 안내](https://www.rabbitmq.com/trademark-guidelines)의 [로고 SVG](https://www.rabbitmq.com/img/rabbitmq-logo.svg) |
| Kafka | [공식 사이트 PNG](https://kafka.apache.org/logos/kafka-logo-no-text.png) |
| MSSQL | [Microsoft SQL Server 다운로드 페이지](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)의 [제품 아이콘 SVG](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/1037761-cardgrid-sql-server2022) |
| PostgreSQL | [공식 보도자료 페이지](https://www.postgresql.org/about/press/)의 [elephant.png](https://www.postgresql.org/media/img/about/press/elephant.png) |
| MySQL | [공식 로고 페이지](https://www.mysql.com/about/legal/logos.html)의 [로고 PNG](https://www.mysql.com/common/logos/logo-mysql-170x115.png) |
| Redis | [공식 사이트](https://redis.io/)의 [아이콘 PNG](https://redis.io/icon.png) |
| Docker | [공식 미디어 자료](https://www.docker.com/company/newsroom/media-resources/)의 [로고 ZIP](https://www.docker.com/static/Docker-Logos-1.zip), `docker-mark-ocean-blue.svg` |
| Kubernetes | [공식 저장소 SVG](https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg) |
| Git | [공식 로고 페이지](https://git-scm.com/downloads/logos)의 [Git-Icon-1788C.svg](https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg) |
| GitHub | [공식 로고 페이지](https://github.com/logos)의 [로고 ZIP](https://brand.github.com/GitHub_Logos.zip), `GitHub_Invertocat_Black.svg` |
| Python | [공식 로고 페이지](https://www.python.org/community/logos/)의 [python-logo-only.svg](https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg) |
| TypeScript | [공식 브랜드 페이지](https://www.typescriptlang.org/branding/)의 [디자인 자료 ZIP](https://www.typescriptlang.org/branding/typescript-design-assets.zip), `ts-logo-128.svg` |
| React | [공식 사이트 저장소 SVG](https://raw.githubusercontent.com/reactjs/react.dev/main/public/images/brand/logo_dark.svg) |
| Java | 다크: [공식 개발자 사이트](https://dev.java/)의 [로고 PNG](https://dev.java/assets/images/java-logo-vector.png) · 라이트: [Oracle Java 페이지](https://www.oracle.com/java/)의 [로고 PNG](https://www.oracle.com/a/ocom/img/rc30v1-java-se.png) |
| JavaScript | [logo.js 저장소](https://github.com/voodootikigod/logo.js)의 `js.svg` (MIT). JavaScript는 공식 로고가 없어 사실상 표준으로 쓰는 이 로고를 사용 |
| C++ | [isocpp.org 공식 로고](https://isocpp.org/assets/images/cpp_logo.png) |
| Go | [공식 브랜드 페이지](https://go.dev/brand)의 [Go-Logo_Blue.svg](https://go.dev/blog/go-brand/Go-Logo/SVG/Go-Logo_Blue.svg) |
| Rust | [공식 저장소 로고](https://www.rust-lang.org/logos/rust-logo-blk.svg) · 라이트: 원본(검정), 다크: 같은 로고의 채움색만 흰색으로 바꿈 |
| PHP | [공식 사이트](https://www.php.net/download-logos.php)의 [new-php-logo.svg](https://www.php.net/images/logos/new-php-logo.svg) |
| Kotlin | [공식 로고 ZIP](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)의 `Kotlin/Primary/Kotlin icon.svg` |
| Swift | [Apple 공식 Swift 페이지](https://developer.apple.com/swift/)의 [swift-logo.svg](https://developer.apple.com/swift/images/swift-logo.svg) |
| Ruby | [공식 로고 페이지](https://www.ruby-lang.org/en/about/logo/)의 [header-ruby-logo.svg](https://www.ruby-lang.org/images/header-ruby-logo.svg) |
| Dart | [공식 사이트 PNG](https://dart.dev/assets/img/logo/dart-logo-for-shares.png)에서 아이콘 부분만 잘라 표시 |
| Scala | [공식 사이트 SVG](https://scala-lang.org/resources/img/scala-spiral.svg) |
| R | [R 프로젝트 공식 로고](https://www.r-project.org/logo/Rlogo.svg) |
| Lua | [공식 사이트 로고 PNG](https://www.lua.org/images/lua.png) · 흰 바탕이 있는 로고라 파란 원 부분만 원형으로 잘라 표시(작은 위성 원과 "the programming language" 글자 제외) |
| Spring | [공식 사이트 SVG](https://spring.io/favicon.svg) |

MSSQL 배포본의 흰색 바탕 경로 하나는 제거하고 로고 본체와 그라데이션은 그대로 유지한다. TypeScript의 파란 사각형, Redis의 빨간 사각형, Java의 흰색 부분 등 원본 로고에 포함된 요소는 유지한다. Dart PNG에도 "Dart" 글자가 들어 있어 아이콘 부분만 잘라 표시한다. C, C#, Elixir, Node.js는 정사각형에 쓸 만한 공식 로고를 찾지 못해 넣지 않았다. Java PNG에는 "Java" 글자가 함께 들어 있어 컵이 작게 보이므로, `viewBox`로 컵 부분만 잘라 표시한다. dev.java 로고는 컵이 흰색이라 라이트 테마에서는 Oracle의 청록색 로고(`java-light.svg`)로 바꿔 표시한다.

Git 로고는 Jason Long의 작품이며 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)으로 배포된다. 각 로고와 상표의 권리는 해당 권리자에게 있다.
