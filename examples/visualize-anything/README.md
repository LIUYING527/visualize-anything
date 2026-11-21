# Visualize Anything v0.1.0

从一个问题、数据集或实验结果出发，生成带证据的视觉分析。Skill 会根据问题选择公开研究、本地评测或通用可视化流程，依照宿主能力交付交互视图、独立 HTML 或静态图。

## 安装到 Codex

直接用 Codex 打开仓库或解压后的发布包即可使用。如果只想装到另一个项目，把 `.agents/skills/visualize-anything` 复制到目标项目的 `.agents/skills/`。打开新会话后，可以用 `$visualize-anything` 显式调用。

- `$visualize-anything 我想看一下全球 AI 发展现状，给我几个可比较的视图。`
- `$visualize-anything 分析当前评测结果，找出相对基线退步最多的任务，并让我查看逐条结果。`
- `$visualize-anything 把这份 CSV 的月度趋势和分组差异画出来。`

联网研究依赖宿主的联网能力。二元评测对比和 Viziverse 导入脚本需要 Node.js 20 或更新版本。

## Demo

- 打开 [评测结果分析](demo.html)，点击任务条形图并筛选逐样本变化。数据为模拟记录。
- 打开 [全球 AI 发展](global-ai.html)，切换模型与投资维度。数据为可追溯的 2024 年历史快照。

两个 HTML 都可以离线打开。Demo 展示输出形式，实际运行时 Skill 会根据请求重新选择数据和图表。

## 用旧项目的数据

在 Viziverse 里导出历史记录，或准备原有查看器支持的事件 JSONL 或指标 CSV。保留仓库或发布包内的 `viewer/import-parser.js`，在根目录运行：

```powershell
node .agents/skills/visualize-anything/scripts/read-viziverse-metrics.cjs ./history.json
```

输出包含指标名、数值、运行、数据切分和可用的步数、轮次与单位。若要定位逐样本退步，提供具有相同样本 ID 的基线和当前评测记录。 [评测指南](../../.agents/skills/visualize-anything/references/evaluations.md)

## v0.1.0 打包与验收

从准备发布的提交运行以下命令。ZIP 保留 Skill、Demo 和解析器的相对目录。

```powershell
node --test examples/visualize-anything/integration.test.cjs
git archive --format=zip --output=visualize-anything-v0.1.0.zip HEAD README.md LICENSE .agents/skills/visualize-anything examples/visualize-anything viewer/import-parser.js
```

解压后运行同一个测试命令，打开两个 HTML 检查交互，再用 Codex 打开解压目录并试用上面的调用示例。
