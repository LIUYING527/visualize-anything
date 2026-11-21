# Visualize Anything v0.1.0

从一个问题、数据集或实验结果出发，生成带证据的视觉分析。Skill 会根据问题选择公开研究、本地评测或通用可视化流程，依照宿主能力交付交互视图、独立 HTML 或静态图。

## 安装到 Codex

解压发布包，把其中的 `visualize-anything` 整个目录复制到目标项目的 `.agents/skills/` 下。从源码安装时，复制源码中的 `.agents/skills/visualize-anything`。最终入口应位于目标项目的 `.agents/skills/visualize-anything/SKILL.md`。打开新会话后，可以用 `$visualize-anything` 显式调用。

- `$visualize-anything 我想看一下全球 AI 发展现状，给我几个可比较的视图。`
- `$visualize-anything 分析当前评测结果，找出相对基线退步最多的任务，并让我查看逐条结果。`
- `$visualize-anything 把这份 CSV 的月度趋势和分组差异画出来。`

联网研究依赖宿主的联网能力。二元评测对比脚本需要 Node.js，其他模式无需该脚本。

## Demo

- 打开 [评测结果分析](demo.html)，点击任务条形图并筛选逐样本变化。数据为模拟记录。
- 打开 [全球 AI 发展](global-ai.html)，切换模型与投资维度。数据为可追溯的 2024 年历史快照。

两个 HTML 都可以离线打开。Demo 展示输出形式，实际运行时 Skill 会根据请求重新选择数据和图表。
