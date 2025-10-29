# templates

- 이 디렉토리에서는 각 에이전트가 생성해야 하는 산출물의 양식을 다룬다.
- 각 산출물 양식은 세가지로 구성된다.
  - README
    - `README.md` 파일명을 가진, 해당 양식과 양식에 대한 설명이다.
  - 템플릿 파일
    - 각 템플릿 파일들은 `.hbs` 확장자를 가지고, [handlebars](https://handlebarsjs.com/guide/) 양식으로 작성된다.
    - 각 양식 파일의 이름에도 변수를 적용할 수 있다.
      - ex:
        - input: worklog-{{에이전트명}}-{{YYMMDD_hhmmss}}.md
        - output: worklog-PO-20251029_13h08m30s.md
  - 예시 파일
    - `.example` 확장자를 가진, 성공적으로 작성된 템플릿 파일의 예시이다.
