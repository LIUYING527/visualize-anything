'use strict';

const fs = require('node:fs');

function index(rows, label) {
  if (!Array.isArray(rows)) throw new Error(label + ' must be an array');
  const result = new Map();
  for (const [position, row] of rows.entries()) {
    if (!row || typeof row.task !== 'string' || !row.task.trim() ||
        typeof row.id !== 'string' || !row.id.trim() || typeof row.passed !== 'boolean') {
      throw new Error(label + ' row ' + (position + 1) + ' requires task, id and boolean passed');
    }
    const key = JSON.stringify([row.task, row.id]);
    if (result.has(key)) throw new Error(label + ' duplicate task and ID: ' + key);
    result.set(key, row);
  }
  return result;
}

function counts() {
  return { matched: 0, baselineOnly: 0, currentOnly: 0, baselinePassed: 0, currentPassed: 0 };
}

function compare(baseline, current) {
  const before = index(baseline, 'Baseline');
  const after = index(current, 'Current');
  const overall = counts();
  const tasks = new Map();
  for (const key of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(key);
    const next = after.get(key);
    const {task, id} = old ?? next;
    if (!tasks.has(task)) {
      tasks.set(task, {task, ...counts(), regressions: [], recoveries: []});
    }
    const group = tasks.get(task);
    for (const scope of [overall, group]) {
      if (!old) scope.currentOnly++;
      else if (!next) scope.baselineOnly++;
      else {
        scope.matched++;
        scope.baselinePassed += Number(old.passed);
        scope.currentPassed += Number(next.passed);
      }
    }
    if (old?.passed === true && next?.passed === false) group.regressions.push(id);
    if (old?.passed === false && next?.passed === true) group.recoveries.push(id);
  }
  const withDelta = scope => ({
    ...scope,
    deltaPercentagePoints: scope.matched
      ? 100 * (scope.currentPassed - scope.baselinePassed) / scope.matched
      : null
  });
  return {overall: withDelta(overall), tasks: [...tasks.values()].map(withDelta)};
}

if (require.main === module) {
  try {
    if (process.argv.length !== 4) {
      throw new Error('Usage: node compare-evaluations.cjs baseline.json current.json');
    }
    const results = process.argv.slice(2).map(path =>
      JSON.parse(fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, ''))
    );
    console.log(JSON.stringify(compare(...results), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {compare};
