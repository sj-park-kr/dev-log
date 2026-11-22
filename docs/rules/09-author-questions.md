# 작성자 질문

작성자가 실제로 질문한 내용을 보존할 때 읽는다. 동화책 형식에서는 질문을 되도록 그림·번호 줄·다른 편 링크로 풀고, 그래도 따로 남겨야 할 때만 쓴다.

- 질문은 페이지(`section.slide`) 안에 넣지 않고 바깥의 `aside.author-questions`에 둔다. 페이지와 aside를 `div.slide-with-question`으로 감싼다.
  ```html
  <div class="slide-with-question">
  <section class="slide">…</section>
  <aside class="author-questions" aria-label="작성자 질문 목록">
  <details class="author-question">
  <summary>Q. 질문 내용</summary>
  <p>A. 답</p>
  </details>
  </aside>
  </div>
  ```
- 1200px 이상 화면에서는 페이지 왼쪽 여백에 떠서 보이고, 그보다 좁으면 페이지 아래에 나온다. 기존 CSS를 쓴다.
- summary에 `Q. 질문 내용`을 바로 적는다. 질문의 뜻과 구체적인 의문을 보존한다.
- 답은 2~3문장으로 짧게 쓴다. 용어의 뜻 → 이유 → 예 순서다. 자세한 내용이 다른 편에 있으면 링크로 넘긴다.
- 처음 읽는 데 꼭 필요한 설명은 본문(그림·번호 줄)에 둔다. 필수 개념을 접힌 답에만 숨기지 않는다.
- 작성자가 묻지 않은 질문을 지어내 작성자 질문처럼 표시하지 않는다. 초보자 페르소나 검토에서 나온 질문은 summary를 `초보 독자 Q.`로 시작하고 aside의 `aria-label`을 `초보 독자 질문 목록`으로 한다([초보자 페르소나 검토](08-review.md)).
- `details` 안에는 빈 줄이나 마크다운 문법을 넣지 않는다.
