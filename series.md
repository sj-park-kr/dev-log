---
layout: page
title: 시리즈
description: 하나의 비유를 따라가다 보면 낯선 개념도 내 것이 돼요.
permalink: /series/
wide: true
---

{% for series in site.data.series %}
{% assign series_posts = site.posts | where: 'series', series.id | sort: 'episode' %}
<section id="{{ series.id | escape }}" class="series-section" style="--series-color: {{ series.color | escape }}" aria-labelledby="title-{{ series.id | escape }}">
  <header class="series-section-heading">
    {% include series-icon.html series=series %}
    <div><h2 id="title-{{ series.id | escape }}">{{ series.title | escape }}</h2><p>{{ series.description | escape }}</p></div>
    <span class="series-badge">{% if series_posts.size > 0 %}글 {{ series_posts.size }}편{% else %}준비 중{% endif %}</span>
  </header>
  <ul class="post-list">
    {% for post in series_posts %}
      {% include post-item.html post=post %}
    {% else %}
      <li class="empty-state">이 주제의 첫 개념 노트를 준비하고 있어요. 곧 만나요!</li>
    {% endfor %}
  </ul>
</section>
{% else %}
<p class="empty-state">새로운 시리즈를 준비하고 있어요.</p>
{% endfor %}
