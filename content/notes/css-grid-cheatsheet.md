---
title: "CSS Grid 布局速查"
date: "2026-04-22"
category: "frontend"
tags: ["CSS", "布局"]
---

## 核心属性

### 容器属性

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 24px;
}
```

### 响应式网格

```css
/* 自动填充，最小 300px */
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

/* 自动适应，更紧凑 */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

### 子元素定位

```css
.item {
  grid-column: 1 / 3;  /* 跨两列 */
  grid-row: span 2;     /* 跨两行 */
}
```

## 常用技巧

- `gap` 替代 `grid-gap`，更现代
- `place-items: center` 一键居中
- `grid-area` 配合命名区域，复杂布局更清晰

## 注意事项

1. Grid 适合**二维布局**，Flexbox 适合**一维布局**
2. 使用 `fr` 单位时，注意配合 `minmax()` 防止内容溢出
3. `auto-fill` 和 `auto-fit` 的区别在于空轨道的处理
