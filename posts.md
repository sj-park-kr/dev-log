---
layout: page
title: 전체 글
description: 궁금한 개념부터 골라 읽어 보세요.
permalink: /posts/
wide: true
---

<ul class="post-list">
  {% for post in site.posts %}
    {% include post-item.html post=post %}
  {% else %}
    <li class="empty-state">첫 개념 노트를 준비하고 있어요.</li>
  {% endfor %}
</ul>
