<div align="center">

<img src="assets/icons/icon-512.png" width="120" alt="Zeus Launcher" />

# ⚡ Zeus Launcher

**Electron과 Node.js로 만든 모던 마인크래프트 런처**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-32-9feaf9.svg)](https://www.electronjs.org/)
![Version](https://img.shields.io/badge/version-0.1.0-blueviolet)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [中文](README.zh.md)

</div>

---

## 소개

Zeus Launcher는 Vanilla / Forge / Fabric 인스턴스를 관리하고, Modrinth에서 모드를 바로 검색·설치할 수 있는 데스크톱 마인크래프트 런처입니다. Microsoft 계정 로그인, 스킨 관리, 다국어 UI, Discord Rich Presence까지 지원합니다.

## ✨ 주요 기능

- 🔑 **Microsoft 계정 로그인** — 계정 목록 관리, 스킨 이미지 변경 / 기본 스킨 초기화
- 🧩 **인스턴스 관리** — Vanilla / Forge / Fabric 인스턴스를 생성하고, 모드로더 버전까지 직접 선택
- 📦 **Modrinth 연동** — 앱 안에서 바로 모드를 검색·설치 (Forge/Fabric 인스턴스에서만 가능하도록 제한)
- 🌐 **다국어 지원** — 한국어 · English · 日本語 · 中文
- 🎨 **커스텀 UI** — 네이티브 select/스크롤바 대신 테마에 맞춘 자체 제작 드롭다운과 스크롤바
- 🔔 **토스트 알림** — 오류/성공 상황을 모던한 토스트로 표시
- 🕹️ **Discord Rich Presence** — 홈/설정 등 현재 보고 있는 화면과, 게임 실행 시 선택한 모드로더·버전까지 실시간으로 표시
- ⚙️ **세부 설정** — 언어, 폰트, 게임 실행 후 런처 자동 숨김, 메모리(RAM), 게임 창 크기, 런처 폴더 바로 열기
- 📜 **업데이트 내역 페이지** — 앱 내에서 변경 이력을 언어별로 확인

## 🛠️ 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 런타임 | [Electron](https://www.electronjs.org/) 32, Node.js |
| 인증 | [msmc](https://github.com/Hanro50/msmc) (Microsoft OAuth) |
| 실행 엔진 | [minecraft-launcher-core](https://github.com/Pierce01/MinecraftLauncherCore) |
| 저장소 | [electron-store](https://github.com/sindresorhus/electron-store) |
| 업데이트 | [electron-updater](https://www.electron.build/auto-update) |
| Discord 연동 | [@xhayper/discord-rpc](https://github.com/xhayper/discord-rpc) |
| 패키징 | [electron-builder](https://www.electron.build/) |

## 🚀 시작하기

### 요구 사항

- [Node.js](https://nodejs.org/) 18 이상
- npm

### 설치

```bash
git clone <repository-url>
cd zeus-launcher
npm install
```

### 개발 모드로 실행

DevTools가 자동으로 열리는 개발 모드입니다.

```bash
npm run dev
```

### 일반 실행

```bash
npm start
```

### 배포용 빌드

```bash
# 현재 플랫폼용
npm run build

# 특정 플랫폼 지정
npm run build:win
npm run build:mac
npm run build:linux
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
src/
├── main/                 # Electron 메인 프로세스
│   ├── config/           # 설정 저장소, 경로 유틸리티
│   ├── ipc/               # 렌더러 ↔ 메인 IPC 핸들러
│   └── services/
│       ├── auth/          # Microsoft / 계정 관리
│       ├── discord/       # Discord Rich Presence
│       ├── minecraft/     # 버전 조회, 인스턴스, 실행기, 스킨
│       ├── modloader/     # Forge / Fabric 로더 버전 조회
│       ├── modpack/       # 모드팩 설치
│       ├── modrinth/      # Modrinth 검색 / 모드 설치
│       └── update/        # 자동 업데이트
├── renderer/              # UI (순수 HTML/CSS/JS)
│   ├── components/        # 커스텀 select, 커스텀 스크롤바
│   ├── i18n/               # 다국어 리소스
│   └── styles/             # 테마 CSS
└── shared/                # 메인/렌더러 공용 상수 (IPC 채널 등)
```

## ⚙️ Discord Rich Presence 설정

기본적으로 `src/main/config/store.js`의 `discordClientId` 값을 사용합니다. 직접 포크해서 배포하는 경우, [Discord Developer Portal](https://discord.com/developers/applications)에서 새 애플리케이션을 만들고 발급받은 Application ID로 교체하세요. Rich Presence 자체를 끄고 싶다면 같은 파일의 `discordRpcEnabled` 값을 `false`로 바꾸면 됩니다.

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.
