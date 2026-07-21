# YN · 一念

Windows 桌面悬浮灵感语录面板 — 让美好的句子时刻陪伴。

![platform](https://img.shields.io/badge/平台-Windows-blue)
![version](https://img.shields.io/badge/版本-0.1.0-blueviolet)

## 功能

- **悬浮面板** — 置顶半透明面板，在桌面展示句子、诗句、名言
- **多来源** — 本地语料 + 在线 API（一言、今日诗词、ZenQuotes、Quotable）
- **切换策略** — 随机来源、固定来源、轮询
- **自动刷新** — 可配置间隔，定时轮换句子
- **收藏与历史** — 收藏喜欢的句子、浏览观看历史、导出收藏
- **全面自定义** — 4 套主题、背景透明度/模糊/颜色、边框、字体大小、文字颜色
- **系统托盘** — 最小化到托盘，右键快速操作
- **全局快捷键** — `Ctrl+Shift+N` 下一句，`Ctrl+Shift+Y` 切换面板
- **安装包** — NSIS 打包的 Windows 安装程序

## 技术栈

| 层       | 技术                                  |
|----------|---------------------------------------|
| 前端     | React 18, TypeScript, Tailwind CSS 4, Zustand |
| 后端     | Rust, Tauri 2.x                      |
| 数据库   | SQLite (tauri-plugin-sql)            |
| 打包     | NSIS                                 |

## 目录结构

```
yn/
├── src/
│   ├── engine/          # 句子来源引擎
│   │   ├── adapters/    # 来源适配器（local、hitokoto、jinrishici、zenquotes、quotable）
│   │   ├── adapter.ts   # 适配器接口
│   │   ├── registry.ts  # 来源注册 + 策略选择
│   │   ├── types.ts     # 核心类型
│   │   └── index.ts     # 统一导出
│   ├── pages/
│   │   ├── FloatingPanel.tsx  # 悬浮窗口
│   │   ├── MainWindow.tsx     # 主配置窗口
│   │   └── config/            # 配置页（显示、来源、定时、收藏、历史、高级）
│   ├── stores/
│   │   ├── configStore.ts     # 配置状态（持久化到磁盘）
│   │   └── sentenceStore.ts   # 句子 + 历史状态
│   ├── lib/
│   │   ├── ipc.ts             # Tauri IPC 封装
│   │   └── db.ts              # SQLite 收藏增删查改 + 导出
│   └── styles/
│       ├── styles.css         # Tailwind 入口
│       └── themes.css         # 主题变量 + 全局滚动条/下拉框样式
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs             # Tauri 初始化（窗口、托盘、快捷键、自启动）
│   │   ├── commands.rs        # IPC 命令
│   │   └── storage.rs         # 配置读写
│   ├── icons/                 # 应用图标
│   ├── capabilities/          # Tauri 2.0 权限声明
│   └── tauri.conf.json        # Tauri 配置
└── scripts/
    └── generate_icon.py       # 图标生成脚本
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) ≥ 18
- [Rust](https://rustup.rs/) ≥ 1.70
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（Windows 必需）
- [NSIS](https://nsis.sourceforge.io/)（打包安装包时需要）

### 开发

```bash
cd yn
npm install
npm run tauri dev
```

### 构建安装包

```bash
npm run tauri build
```

输出：`src-tauri/target/release/bundle/nsis/YN_0.1.0_x64-setup.exe`

### 运行测试

```bash
npm test
```

## 配置说明

主窗口侧边栏可配置以下内容：

| 页面   | 说明                              |
|--------|-----------------------------------|
| 显示   | 主题、面板开关、背景/边框/字体/颜色 |
| 来源   | 启用/禁用句子来源、选择切换策略     |
| 定时   | 自动刷新间隔                       |
| 收藏   | 已收藏句子（支持导出 JSON/CSV/TXT） |
| 历史   | 最近浏览的句子                     |
| 高级   | 开机自启动                         |

## 句子来源

| 来源       | 类型   | 语言 | 说明                    |
|------------|--------|------|------------------------|
| 本地语料   | 离线   | 中/英 | 35 条内置句子           |
| 一言       | 在线   | 中文  | v1.hitokoto.cn         |
| 今日诗词   | 在线   | 中文  | v1.jinrishici.com      |
| ZenQuotes  | 在线   | 英文  | zenquotes.io           |
| Quotable   | 在线   | 英文  | api.quotable.io        |

## 全局快捷键

| 快捷键          | 功能     |
|-----------------|----------|
| Ctrl+Shift+N    | 下一句   |
| Ctrl+Shift+Y    | 切换面板 |

## 开源协议

MIT
