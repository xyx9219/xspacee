---
title: "Markdown 最佳实践"
date: "2026-04-10"
category: "tool"
tags: ["Markdown", "工作流"]
---

## 为什么用 Markdown

Markdown 是一种**轻量级标记语言**，它的设计哲学是：

> 让写作回归内容本身，而不是排版。

优点：

- **纯文本**，任何编辑器都能打开
- **易读易写**，语法直观
- **可转换**，轻松生成 HTML、PDF、Word
- **版本友好**，diff 清晰可见

## YAML Front Matter

在 Markdown 文件顶部添加元数据：

```markdown
---
title: "文章标题"
date: "2026-04-25"
tags: ["标签1", "标签2"]
excerpt: "自定义摘要"
---

正文内容...
```

这些元数据可以被构建脚本读取，自动生成索引和分类。

## 我的写作工作流

1. 在 `content/essays/` 或 `content/notes/` 下新建 `.md` 文件
2. 填写 Front Matter 元数据
3. 用 Markdown 写正文
4. 运行 `python build.py` 生成数据
5. 刷新网页查看效果

## 常用语法速查

| 效果 | 语法 |
|------|------|
| 标题 | `# H1` `## H2` |
| 加粗 | `**bold**` |
| 斜体 | `*italic*` |
| 代码 | `` `code` `` |
| 代码块 | ` ```lang ` |
| 链接 | `[text](url)` |
| 图片 | `![alt](url)` |
| 引用 | `> quote` |
| 列表 | `- item` 或 `1. item` |
| 分割线 | `---` |

## 写作建议

- 一个文件一个主题，保持聚焦
- 善用标题层级，让结构清晰
- 代码块标注语言，获得语法高亮
- 适当使用引用和列表，提高可读性
