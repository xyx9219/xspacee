#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
XYX Personal Website - Content Builder
======================================
自动将 content/ 目录下的 Markdown 文件转换为网站数据。

使用方法:
    python build.py

文件结构:
    content/
    ├── essays/          # 随笔文章
    │   └── *.md
    └── notes/           # 学习心得
        └── *.md

Markdown 文件格式:
    ---
    title: "文章标题"
    date: "2026-04-25"
    category: "tech"      # essays: tech, design, life, reading
    tags: ["标签1", "标签2"]
    excerpt: "文章摘要（可选，默认取正文前200字）"
    ---

    正文内容支持标准 Markdown 语法...
"""

import os
import re
import json
import glob
from pathlib import Path
from datetime import datetime

CONTENT_DIR = Path("content")
DATA_DIR = Path("data")


def parse_front_matter(text):
    """解析 YAML Front Matter"""
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, text, re.DOTALL)

    if not match:
        return {}, text

    fm_text, body = match.groups()
    meta = {}

    # Parse simple key: value pairs
    for line in fm_text.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue

        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            # Parse arrays
            if value.startswith('[') and value.endswith(']'):
                value = [v.strip().strip('"').strip("'") for v in value[1:-1].split(',') if v.strip()]
            # Parse booleans
            elif value.lower() == 'true':
                value = True
            elif value.lower() == 'false':
                value = False
            # Parse numbers
            elif value.isdigit():
                value = int(value)

            meta[key] = value

    return meta, body.strip()


def generate_id(title, date_str):
    """根据标题和日期生成唯一 ID"""
    date_part = date_str.replace('-', '') if date_str else datetime.now().strftime('%Y%m%d')
    slug = re.sub(r'[^\w\s-]', '', title).strip().lower()
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug[:40]  # limit length
    return f"{date_part}-{slug}"


def md_to_html(md_text):
    """简单的 Markdown 到 HTML 转换"""
    html = md_text
    placeholders = {}
    counter = [0]

    def make_placeholder(content):
        key = f"{{{{PH{counter[0]}}}}}"
        counter[0] += 1
        placeholders[key] = content
        return key

    # 1. Protect code blocks
    def code_block_replacer(match):
        lang = match.group(1) or ''
        code = match.group(2)
        # Escape HTML inside code blocks
        code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        return make_placeholder(f'<pre><code class="language-{lang}">{code}</code></pre>')

    html = re.sub(r'```(\w+)?\n(.*?)```', code_block_replacer, html, flags=re.DOTALL)

    # 2. Protect inline code
    def inline_code_replacer(match):
        code = match.group(1)
        code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        return make_placeholder(f'<code>{code}</code>')

    html = re.sub(r'`([^`]+)`', inline_code_replacer, html)

    # 3. Escape remaining HTML
    html = html.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    # 4. Headers
    html = re.sub(r'^####\s+(.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^#\s+(.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # 5. Bold & Italic
    html = re.sub(r'\*\*\*(.*?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = re.sub(r'___(.*?)___', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'__(.*?)__', r'<strong>\1</strong>', html)
    html = re.sub(r'_(.*?)_', r'<em>\1</em>', html)

    # 6. Blockquote
    def quote_replacer(match):
        lines = match.group(1).strip().split('\n')
        content = '\n'.join(line.lstrip('> ').lstrip('>') for line in lines)
        return make_placeholder(f'<blockquote>\n<p>{content}</p>\n</blockquote>')

    html = re.sub(r'(^>.*(?:\n^>.*)*)', quote_replacer, html, flags=re.MULTILINE)

    # 7. Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank">\1</a>', html)

    # 8. Images — fix relative paths to point to /content/images/
    def img_replacer(match):
        alt = match.group(1)
        src = match.group(2)
        if not src.startswith('http') and not src.startswith('/'):
            src = '/content/images/' + src.split('/')[-1]
        return f'<img src="{src}" alt="{alt}" loading="lazy">'

    html = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', img_replacer, html)

    # 9. Horizontal rule
    html = re.sub(r'^---\s*$', '<hr>', html, flags=re.MULTILINE)

    # 10. Unordered lists
    def ul_replacer(match):
        items = match.group(0).strip().split('\n')
        lis = ''.join(f'<li>{item.lstrip("- *").strip()}</li>' for item in items)
        return make_placeholder(f'<ul>\n{lis}\n</ul>')

    html = re.sub(r'(?:^[-*]\s+.*\n?)+', ul_replacer, html, flags=re.MULTILINE)

    # 11. Ordered lists
    def ol_replacer(match):
        items = match.group(0).strip().split('\n')
        lis = ''.join(f'<li>{re.sub(r"^\d+\.\\s*", "", item).strip()}</li>' for item in items)
        return make_placeholder(f'<ol>\n{lis}\n</ol>')

    html = re.sub(r'(?:^\d+\.\s+.*\n?)+', ol_replacer, html, flags=re.MULTILINE)

    # 12. Paragraphs
    paragraphs = html.split('\n\n')
    new_paragraphs = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        # Check if it starts with an HTML tag or contains a placeholder
        if p.startswith('<') or '{{PH' in p:
            new_paragraphs.append(p)
        else:
            p = p.replace('\n', '<br>')
            new_paragraphs.append(f'<p>{p}</p>')

    html = '\n\n'.join(new_paragraphs)

    # 13. Restore placeholders
    for key, value in placeholders.items():
        html = html.replace(key, value)

    return html


def extract_excerpt(body, max_len=200):
    """提取文章摘要"""
    # Remove markdown syntax for excerpt
    text = re.sub(r'[#*_`\[\]!]', '', body)
    text = re.sub(r'\(.*?\)', '', text)
    text = re.sub(r'\n+', ' ', text).strip()
    if len(text) > max_len:
        text = text[:max_len].rsplit(' ', 1)[0] + '...'
    return text


def process_markdown_files(subdir, article_type):
    """处理指定子目录下的所有 Markdown 文件"""
    md_dir = CONTENT_DIR / subdir
    if not md_dir.exists():
        print(f"  目录不存在: {md_dir}")
        return []

    articles = []
    md_files = sorted(glob.glob(str(md_dir / "*.md")))

    print(f"  找到 {len(md_files)} 个 Markdown 文件")

    for filepath in md_files:
        path = Path(filepath)
        print(f"    处理: {path.name}")

        with open(filepath, 'r', encoding='utf-8') as f:
            raw = f.read()

        meta, body = parse_front_matter(raw)

        title = meta.get('title', path.stem)
        date = meta.get('date', datetime.now().strftime('%Y-%m-%d'))
        category = meta.get('category', '')
        tags = meta.get('tags', [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',')]

        excerpt = meta.get('excerpt', '')
        if not excerpt:
            excerpt = extract_excerpt(body)

        article_id = meta.get('id', generate_id(title, date))
        html_content = md_to_html(body) if body else ''

        article = {
            "id": article_id,
            "type": article_type,
            "title": title,
            "date": date,
            "category": category,
            "tags": tags,
            "excerpt": excerpt,
            "content": html_content,
            "source": str(path)
        }

        articles.append(article)

    # Sort by date descending
    articles.sort(key=lambda x: x['date'], reverse=True)
    return articles


def build():
    """主构建函数"""
    print("=" * 50)
    print("XYX 网站内容构建工具")
    print("=" * 50)

    # Ensure directories exist
    CONTENT_DIR.mkdir(exist_ok=True)
    (CONTENT_DIR / "thoughts").mkdir(exist_ok=True)
    (CONTENT_DIR / "notes").mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)

    print("\n[1/2] 处理随想 (thoughts)...")
    essays = process_markdown_files("thoughts", "essay")

    print("\n[2/2] 处理学习心得 (notes)...")
    notes = process_markdown_files("notes", "note")

    # Save JSON
    essays_path = DATA_DIR / "essays.json"
    notes_path = DATA_DIR / "notes.json"

    with open(essays_path, 'w', encoding='utf-8') as f:
        json.dump(essays, f, ensure_ascii=False, indent=2)

    with open(notes_path, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 50}")
    print(f"构建完成!")
    print(f"  随想: {len(essays)} 篇 → {essays_path}")
    print(f"  心得: {len(notes)} 条 → {notes_path}")
    print(f"{'=' * 50}")

    return essays, notes


if __name__ == '__main__':
    build()
