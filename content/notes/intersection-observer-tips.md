---
title: "IntersectionObserver 使用技巧"
date: "2026-04-18"
category: "frontend"
tags: ["JavaScript", "性能优化"]
---

## 基本用法

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // 只触发一次
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});
```

## 参数解析

| 参数 | 说明 |
|------|------|
| `threshold` | 元素可见比例达到多少时触发，0~1 |
| `rootMargin` | 扩展/缩小视口范围，类似 CSS margin |
| `root` | 指定滚动容器，默认是视口 |

## 性能优势

相比 scroll 事件监听：

- **无需持续计算** — 浏览器底层优化
- **自动节流** — 不需要自己写 throttle/debounce
- **精准触发** — 只在状态变化时回调

## 实用场景

1. **无限滚动加载** — 检测 sentinel 元素是否进入视口
2. **图片懒加载** — 接近视口时再加载
3. **滚动动画** — 元素进入视口时添加动画类
4. **广告可见性追踪** — 统计真正的曝光次数

## 注意事项

- 回调在**主线程**执行，避免 heavy computation
- 使用 `unobserve()` 及时清理，防止内存泄漏
- 对于频繁变化的元素，考虑 `threshold` 数组 `[0, 0.25, 0.5, 0.75, 1]`
