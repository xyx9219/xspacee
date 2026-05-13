# XSPACEE 内容管理指南

## 项目结构

```
xspacee/
├── index.html
├── css/style.css
├── js/main.js
├── content/
│   ├── thoughts/        ← 随想（长文）放这里
│   ├── notes/           ← 学习心得（短记录）放这里
│   └── images/          ← 文章用到的图片放这里
├── data/
│   ├── essays.json      ← build.py 自动生成，不要手动改
│   └── notes.json       ← build.py 自动生成，不要手动改
├── build.py             ← 构建脚本
└── favicon.svg
```

---

## 一、添加新随想（Thought）

### 1. 创建 Markdown 文件

在 `content/thoughts/` 下新建 `.md` 文件，文件名用英文小写+连字符，例如：

```
content/thoughts/my-new-thought.md
```

### 2. 写 Front Matter 和正文

```markdown
---
title: "文章标题"
date: "2026-05-13"
category: "tech"
tags: ["标签1", "标签2"]
excerpt: "一句话摘要（可选，不写会自动取正文前200字）"
---

## 正文标题

正文内容...
```

### 3. 分类选项

随想的 category 只能填以下四个之一：

| 值 | 含义 | 对应筛选按钮 |
|------|------|------|
| `tech` | 技术 | TECH |
| `design` | 设计 | DESIGN |
| `life` | 生活 | LIFE |
| `reading` | 阅读 | READING |

### 4. tags 格式

```yaml
tags: ["前端", "CSS", "响应式"]
```

用英文方括号包裹，逗号分隔，每个标签用双引号。

### 5. 日期格式

必须是 `YYYY-MM-DD`，例如 `"2026-05-13"`。日期影响排序（新的排前面）。

---

## 二、添加新笔记（Note）

### 1. 创建 Markdown 文件

在 `content/notes/` 下新建 `.md` 文件：

```
content/notes/my-new-note.md
```

### 2. 写 Front Matter 和正文

格式和随想完全一样，只是 category 的选项不同。

### 3. 分类选项

笔记的 category 只能填以下四个之一：

| 值 | 含义 | 对应筛选按钮 |
|------|------|------|
| `frontend` | 前端 | FRONTEND |
| `backend` | 后端 | BACKEND |
| `algorithm` | 算法 | ALGORITHM |
| `tool` | 工具 | TOOLS |

---

## 三、Front Matter 详解

```yaml
---
title: "文章标题"          ← 必填，显示在列表和详情页
date: "2026-05-13"        ← 必填，格式 YYYY-MM-DD
category: "tech"           ← 必填，只能是上面列出的值
tags: ["标签1", "标签2"]   ← 必填，数组格式
excerpt: "自定义摘要"      ← 可选，不写则自动取正文前200字
---
```

**注意**：Front Matter 必须在文件最开头，用 `---` 包裹。

---

## 四、图片处理

### 1. 放置图片文件

将图片放到 `content/images/` 目录下：

```
content/images/
├── screenshot.png
├── diagram.svg
└── photo.jpg
```

支持的格式：`.png`、`.jpg`、`.jpeg`、`.gif`、`.svg`、`.webp`

### 2. 在 Markdown 中引用图片

```markdown
![图片描述](screenshot.png)
```

**只用写文件名**，不要写路径。build.py 会自动把路径转换为 `/content/images/文件名`。

例如你写 `![示例](demo.png)`，构建后 HTML 中会变成：

```html
<img src="/content/images/demo.png" alt="示例" loading="lazy">
```

### 3. 引用外部图片（URL）

直接用完整 URL：

```markdown
![外部图片](https://example.com/photo.jpg)
```

外部 URL 不会被修改路径。

---

## 五、Markdown 语法支持

| 语法 | 写法 | 效果 |
|------|------|------|
| 标题 | `## 标题` | h2（建议从 h2 开始） |
| 加粗 | `**加粗**` | **加粗** |
| 斜体 | `*斜体*` | *斜体* |
| 行内代码 | `` `code` `` | `code` |
| 代码块 | ` ```lang ` 包裹 | 带语言高亮的代码块 |
| 链接 | `[文字](url)` | 可点击链接 |
| 图片 | `![描述](文件名.png)` | 图片（放 content/images/） |
| 引用 | `> 引用内容` | 引用块 |
| 无序列表 | `- 项目` | 列表 |
| 有序列表 | `1. 项目` | 编号列表 |
| 分割线 | `---` | 水平线 |

---

## 六、完整发布流程

### 第一步：写内容

```
1. 在 content/thoughts/ 或 content/notes/ 下新建 .md 文件
2. 如果有图片，把图片放到 content/images/
3. 在 .md 文件中用 ![描述](文件名.png) 引用图片
```

### 第二步：构建

```bash
cd D:\xyx\Project\xspacee
python build.py
```

这会读取所有 Markdown 文件，生成 `data/essays.json` 和 `data/notes.json`。

### 第三步：本地预览（可选）

```bash
python -m http.server 8080
```

浏览器打开 `http://localhost:8080` 查看效果。

### 第四步：提交并推送到 GitHub

```bash
git add .
git commit -m "新增文章：文章标题"
git push origin master
```

推送后 1-2 分钟，GitHub Pages 自动更新。

---

## 七、Git 操作速查

```bash
# 查看当前状态（哪些文件改了/新增了）
git status

# 添加所有改动
git add .

# 提交（-m 后面写本次改动的说明）
git commit -m "新增文章：XXX"

# 推送到 GitHub
git push origin master

# 一次性完成（添加+提交+推送）
git add . && git commit -m "新增文章：XXX" && git push origin master
```

---

## 八、常见问题

### Q：修改已有文章怎么办？

直接编辑对应的 `.md` 文件，然后重新 `python build.py` → `git add .` → `git commit` → `git push`。

### Q：删除文章怎么办？

删除对应的 `.md` 文件，然后 `python build.py` 重新构建，JSON 会自动更新。

### Q：文章不显示？

1. 检查 Front Matter 格式是否正确（`---` 包裹，字段齐全）
2. 检查 category 是否是允许的值
3. 确认运行了 `python build.py`
4. 确认 `git push` 成功

### Q：图片不显示？

1. 确认图片文件在 `content/images/` 目录下
2. 确认 Markdown 中只写了文件名（不含路径）
3. 确认文件名大小写一致
4. 确认 `git push` 时图片文件被包含（检查 `git status`）
