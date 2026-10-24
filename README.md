# Agent Kitchen Video

用 Remotion 编写的《AI 厨房》解释视频工程：通过一间厨房，把 LLM、Agent、Tool、Skill、Memory、Command、Hook、MCP 和 Plugin 等概念串起来。

项目包含完整的 1280×720、30 fps 视频合成代码，分为片头/覆盖层和 G1–G13 共 13 个构建组，并提供每组的预览合成。

## 快速开始

```bash
npm install
npm run typecheck
npm run studio
```

然后在 Remotion Studio 中选择 `Video` 预览整片，或选择 `Overlay`、`G1`–`G13` 检查单个构建组。

## 渲染

```bash
# 打包并渲染整片
VER=v1 scripts/render.sh

# 仅执行类型检查
npm run typecheck
```

整片渲染输出到 `renders/`。构建目录、渲染帧、预览图和缓存均已加入 `.gitignore`，不会进入 Git 历史。

## 音频

`src/Main.tsx` 会读取 `public/assets/agent-kitchen/audio.wav`。该文件约 100.8 MB，超过 GitHub 单文件限制，因此没有提交到仓库。

如需生成配音，可根据 `script/narration.txt` 使用：

```bash
python3 scripts/tts_build.py
```

也可以将自己的 48 kHz、16-bit WAV 文件放到同一路径。生成的 `script/timeline.json`、字幕和时间轴文件应与配音保持同步。

## 目录结构

```text
src/                 Remotion 合成、通用组件和 G1–G13 镜头
script/              解说词、分镜、时间轴
scripts/             TTS、渲染、预览和质量检查脚本
research/            调研资料
public/fonts/        项目使用的字体及其许可文件
public/assets/       项目素材（大体积本地音频不提交）
```

## 许可与素材

字体许可信息见 [`public/fonts/LICENSE.md`](public/fonts/LICENSE.md)。项目中的音频、视频和其他素材请在发布前确认来源、授权范围和再分发条件。

