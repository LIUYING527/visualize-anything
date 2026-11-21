# Visualizing experiments and evaluations

Discover relevant result files and the evaluation configuration from the current project. Identify the run, model or configuration, dataset version, metric direction, sample count, and baseline. Follow existing project conventions for metrics and aggregation. Distinguish failed, excluded, and unscored items.

Example request: “把现在的评测结果可视化，分析哪里退步了。”

- Compare run and baseline at equivalent evaluation settings. When examples align, compute paired deltas from shared example IDs and show coverage. If only aggregates are available, report aggregate differences with the comparability limits.
- Start with an overall comparison when the aggregation is meaningful. Follow with task or cohort deltas and sample counts. If example-level output exists, link significant slices to representative regressions and recoveries. Use pass-to-fail transitions for binary outcomes.
- Show accuracy against cost or latency when the data supports that trade-off. Keep metric direction explicit and label percentage-point changes accurately.
- Report uncertainty when the necessary data and assumptions support it. Treat small slices as exploratory and keep explanations of regressions grounded in the available examples.

For matched binary evaluations, normalize scored inputs to two JSON arrays of records with nonempty string fields `task` and `id` and a boolean field `passed`. Run `node scripts/compare-evaluations.cjs baseline.json current.json` using the script's full path from this skill folder. The script returns matched results, per-task totals, transition IDs, and counts of unpaired rows. Report failures and exclusions identified during normalization separately. Use the project's own aggregation for non-binary metrics or when task weights differ.

### Viziverse logs and exports

When working in the Visualize Anything repository, reuse the desktop viewer's import parser for its exported history JSON, event JSONL, or supported metric CSV. From the repository root run `node .agents/skills/visualize-anything/scripts/read-viziverse-metrics.cjs path/to/log`. The output contains scalar metric observations with run, split, step, epoch, and unit where present. Compare like series at aligned steps or epochs. For CSV without run metadata, label series by their source file. These observations only support sample-level analysis when a separate source provides explicit per-example scores and IDs.
