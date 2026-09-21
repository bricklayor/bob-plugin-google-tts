# Bob Plugin - Google Cloud TTS (Chirp 3 HD)

[![Release](https://img.shields.io/github/v/release/bricklayor/bob-plugin-google-tts)](https://github.com/bricklayor/bob-plugin-google-tts/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 **Google Cloud Text-to-Speech API** 开发的 [Bob](https://bobtranslate.com) 语音合成（TTS）插件，专为接入 Google 最新一代 **Chirp 3：高清拟真语音（Chirp 3: HD voices）** 而设计。

告别机械生硬的旧式电子音，提供宛如真人般自然的情感起伏、呼吸停顿与语调质感。

---

## 核心特性

- **Chirp 3: HD 高清拟真音色**：原生接入 Google Cloud 最新大模型语音架构，具备出色的人声质感、呼吸细节与情感表现力。
- **50+ 语言全球覆盖**：
  - **中文普通话 (`cmn-CN`)**：提供 Kore（女声）、Charon（男声）、Aoede、Fenrir 等 30 种高清角色。
  - **英文 (`en-US`)**：专业沉稳男声 Charon、自然生动女声 Kore 等 30 种音色。
  - **多语种无缝支持**：涵盖日、韩、法、德、西、俄、意、粤语 (`yue-HK`) 等 50 余种主流语种。
- **智能语种与音色自动匹配**：
  - 支持中英文常用发音人独立下拉选择。
  - 支持设置全局性格角色（如 Kore / Charon 等），自动适配其它小语种发音人。
  - 支持「自定义指定音色」，填入任意官方 Voice Name（如 Journey、Neural2 或特定小语种音色）强制覆盖。
- **音频编码自由切换**：
  - **MP3**（默认推荐，兼容性极佳）
  - **OGG_OPUS**（高保真低延迟）
  - **LINEAR16**（无损 PCM 音质）
- **一键服务连通性验证**：完美适配 Bob 1.6.0+ 设置面板「验证」功能，毫秒级轻量探针测试网络连通性与 API Key 有效性。
- **自定义反代与代理域名支持**：支持自建中转反向代理地址，无缝解决网络直连问题。

---

## 安装方法

1. 前往 [Releases](https://github.com/bricklayor/bob-plugin-google-tts/releases) 页面下载最新的 `google-tts.bobplugin`。
2. 双击下载的 `.bobplugin` 文件，Bob 将自动提示并完成安装。
3. 打开 **Bob 偏好设置 → 服务 → 语音合成**，添加 **Google TTS (Chirp 3)**。
4. 填入你的 Google Cloud API Key，点击右下角 **「验证」** 测试通过后即可使用！

---

## 获取 Google Cloud API Key 指南

1. 登录 [Google Cloud Console](https://console.cloud.google.com/) 并新建或选择一个项目。
2. 在顶部搜索框搜索 **Cloud Text-to-Speech API** 并点击 **启用 (Enable)**。
3. 进入 **API 和服务 → 凭据 (Credentials)**，点击 **创建凭据 → API 密钥 (API Key)**。
4. （建议）点击该密钥进入配置，在「API 限制」中勾选仅允许 `Cloud Text-to-Speech API`。
5. 将生成的 API 密钥复制并粘贴到 Bob 插件配置中。

> [!TIP]
> **免费额度说明**：Google Cloud Text-to-Speech 为 **Chirp 3: HD voices** 提供 **每月前 100 万字符完全免费** 的额度，日常划词发音朗读基本完全覆盖无需任何费用。

---

## 配置项说明

| 配置项 | 默认值 | 说明 |
|---|---|---|
| **API Key** | 空 | 必填。你的 Google Cloud API 密钥（需启用 Cloud Text-to-Speech API）。 |
| **中文普通话音色** | `cmn-CN-Chirp3-HD-Kore` | 朗读中文普通话发音人（Kore 女声、Charon 男声、Aoede、Fenrir 等）。 |
| **英语音色** | `en-US-Chirp3-HD-Charon` | 朗读英语文本发音人（Charon 专业沉稳男声、Kore 自然女声等）。 |
| **粤语音色** | `yue-HK-Chirp3-HD-Kore` | 朗读粤语（香港）发音人（Kore 女声、Charon 男声等）。 |
| **日语音色** | `ja-JP-Chirp3-HD-Kore` | 朗读日语文本发音人（Kore 柔和女声、Charon 磁性男声等）。 |
| **韩语音色** | `ko-KR-Chirp3-HD-Kore` | 朗读韩语文本发音人（Kore 清澈女声、Charon 沉稳男声等）。 |
| **法语音色** | `fr-FR-Chirp3-HD-Kore` | 朗读法语文本发音人。 |
| **德语音色** | `de-DE-Chirp3-HD-Kore` | 朗读德语文本发音人。 |
| **西班牙语音色** | `es-ES-Chirp3-HD-Kore` | 朗读西班牙语文本发音人。 |
| **俄语音色** | `ru-RU-Chirp3-HD-Aoede` | 朗读俄语文本发音人。 |
| **意大利语音色** | `it-IT-Chirp3-HD-Kore` | 朗读意大利语文本发音人。 |
| **其它语种默认性格** | `Kore` | 朗读阿拉伯语、泰语、越南语等其余 40 余种语言时默认匹配的统一人格角色。 |
| **全局强制音色 (可选)** | 空 | 强行覆盖所有语种音色（如填入 `en-US-Journey-D`），留空按上方语种智能匹配。 |
| **音频编码格式** | `MP3` | MP3（推荐） / OGG_OPUS / LINEAR16。 |
| **自定义 API 地址 / 反代** | 空 | 留空默认使用官方 `https://texttospeech.googleapis.com`。 |

---

## 开发者打包与测试

```bash
# 运行单元测试
bun tests/test_plugin.js

# 运行真实 Google Cloud API 连通性测试（需在环境变量设置 GOOGLE_TTS_KEY）
GOOGLE_TTS_KEY="your-api-key" bun tests/test_e2e.js

# 打包为 .bobplugin 并自动生成/更新 appcast.json
./scripts/build.py "版本更新说明"
```

---

## 开源许可

本项目基于 [MIT License](LICENSE) 开源。
