<div align="center">

<img src="assets/icons/icon-512.png" width="120" alt="Zeus Launcher" />

# ⚡ Zeus Launcher

**Electron と Node.js で作られたモダンな Minecraft ランチャー**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-32-9feaf9.svg)](https://www.electronjs.org/)
![Version](https://img.shields.io/badge/version-0.1.0-blueviolet)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [中文](README.zh.md)

</div>

---

## 概要

Zeus Launcher は、Vanilla / Forge / Fabric インスタンスを管理し、Modrinth からアプリ内で直接 MOD を検索・インストールできるデスクトップ版 Minecraft ランチャーです。Microsoft アカウントログイン、スキン管理、多言語対応 UI、Discord Rich Presence をサポートしています。

## ✨ 主な機能

- 🔑 **Microsoft アカウントログイン** — アカウント一覧の管理、画像からのスキン変更 / デフォルトスキンへの初期化
- 🧩 **インスタンス管理** — Vanilla / Forge / Fabric インスタンスを作成し、MOD ローダーのバージョンまで直接選択
- 📦 **Modrinth 連携** — アプリ内で MOD を検索・インストール（インストールは Forge/Fabric インスタンスのみ可能）
- 🌐 **多言語対応** — 韓国語 · English · 日本語 · 中文
- 🎨 **カスタム UI** — ネイティブの select / スクロールバーの代わりに、テーマに合わせて自作したドロップダウンとスクロールバー
- 🔔 **トースト通知** — エラー・成功をモダンなトーストで表示
- 🕹️ **Discord Rich Presence** — 現在見ている画面（ホーム、インスタンス、設定など）と、ゲーム実行中は選択した MOD ローダー・バージョンをリアルタイムに表示
- ⚙️ **詳細設定** — 言語、フォント、ゲーム起動後のランチャー自動非表示、メモリ (RAM)、ゲームウィンドウサイズ、ランチャーフォルダのクイックオープン
- 📜 **アプリ内アップデート履歴** — 選択した言語で更新履歴を確認可能

## 🛠️ 技術スタック

| 分類 | 技術 |
| --- | --- |
| ランタイム | [Electron](https://www.electronjs.org/) 32, Node.js |
| 認証 | [msmc](https://github.com/Hanro50/msmc) (Microsoft OAuth) |
| ゲーム起動 | [minecraft-launcher-core](https://github.com/Pierce01/MinecraftLauncherCore) |
| データ保存 | [electron-store](https://github.com/sindresorhus/electron-store) |
| 自動更新 | [electron-updater](https://www.electron.build/auto-update) |
| Discord 連携 | [@xhayper/discord-rpc](https://github.com/xhayper/discord-rpc) |
| パッケージング | [electron-builder](https://www.electron.build/) |

## 🚀 はじめに

### 必要環境

- [Node.js](https://nodejs.org/) 18 以上
- npm

### インストール

```bash
git clone <repository-url>
cd zeus-launcher
npm install
```

### 開発モードで実行

DevTools が自動的に開く開発モードです。

```bash
npm run dev
```

### 通常起動

```bash
npm start
```

### 配布用ビルド

```bash
# 現在のプラットフォーム向け
npm run build

# プラットフォームを指定
npm run build:win
npm run build:mac
npm run build:linux
```

ビルド成果物は `dist/` フォルダに出力されます。

## 📁 プロジェクト構成

```
src/
├── main/                 # Electron メインプロセス
│   ├── config/           # 設定ストア、パスユーティリティ
│   ├── ipc/               # レンダラー ↔ メイン間の IPC ハンドラ
│   └── services/
│       ├── auth/          # Microsoft 認証 / アカウント管理
│       ├── discord/       # Discord Rich Presence
│       ├── minecraft/     # バージョン取得、インスタンス、起動処理、スキン
│       ├── modloader/     # Forge / Fabric ローダーのバージョン取得
│       ├── modpack/       # モッドパックのインストール
│       ├── modrinth/      # Modrinth 検索 / MOD インストール
│       └── update/        # 自動アップデート
├── renderer/              # UI（素の HTML/CSS/JS）
│   ├── components/        # カスタム select、カスタムスクロールバー
│   ├── i18n/               # 多言語リソース
│   └── styles/             # テーマ CSS
└── shared/                # メイン/レンダラー共通の定数（IPC チャンネルなど）
```

## ⚙️ Discord Rich Presence の設定

デフォルトでは `src/main/config/store.js` の `discordClientId` の値を使用します。フォークして配布する場合は、[Discord Developer Portal](https://discord.com/developers/applications) で新しいアプリケーションを作成し、発行された Application ID に置き換えてください。Rich Presence 自体を無効化したい場合は、同じファイルの `discordRpcEnabled` を `false` にしてください。

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
