'use strict';

const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');

const skill = path.resolve(__dirname, '../../.agents/skills/visualize-anything');
const {compare} = require(path.join(skill, 'scripts/compare-evaluations.cjs'));

test('compares only matched scores and reports transitions', () => {
  const score = (id, passed) => ({task: 'QA', id, passed});
  const result = compare(
    [score('a', true), score('b', false), score('old', true)],
    [score('a', false), score('b', true), score('new', false)]
  );
  assert.equal(result.overall.matched, 2);
  assert.equal(result.overall.baselineOnly, 1);
  assert.equal(result.overall.currentOnly, 1);
  assert.equal(result.overall.deltaPercentagePoints, 0);
  assert.deepEqual(result.tasks[0].regressions, ['a']);
  assert.deepEqual(result.tasks[0].recoveries, ['b']);
  assert.equal(compare([], []).overall.deltaPercentagePoints, null);
  assert.throws(() => compare([score('a', true), score('a', false)], []), /duplicate/);
});

test('reads viewer exports, JSONL events and metric CSV through the bundled parser', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'visualize-anything-'));
  try {
    const metric = {type: 'metric', run_id: 'eval-a', step: 4,
      data: {name: 'accuracy', value: 0.91, split: 'validation', unit: 'ratio'}};
    const log = {type: 'log', data: {}};
    const cases = [
      ['history.json', JSON.stringify({events: [metric, log]}), 1],
      ['events.jsonl', [metric, log].map(value => JSON.stringify(value)).join('\n'), 1],
      ['metrics.csv', 'step,name,value,split\n4,accuracy,0.91,validation', 0]
    ];
    for (const [name, contents, skipped] of cases) {
      const file = path.join(directory, name);
      fs.writeFileSync(file, contents);
      const script = path.join(skill, 'scripts/read-viziverse-metrics.cjs');
      const output = JSON.parse(execFileSync(process.execPath, [script, file], {encoding: 'utf8'}));
      assert.equal(output.skippedEvents, skipped);
      assert.equal(output.observations.length, 1);
      assert.equal(output.observations[0].step, 4);
      assert.equal(output.observations[0].value, 0.91);
      assert.equal(output.observations[0].split, 'validation');
    }
  } finally {
    for (const name of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, name));
    fs.rmdirSync(directory);
  }
});

function loadDemo(file, defaults) {
  const nodes = new Map();
  const element = () => ({children: [], events: {},
    append(child) { this.children.push(child); },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, callback) { this.events[name] = callback; }});
  const document = {createElement: element, getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, {...element(), value: defaults[id]});
    return nodes.get(id);
  }};
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  vm.runInNewContext(html.match(/<script>([\s\S]+)<\/script>/)[1], {document});
  return nodes;
}

test('evaluation demo updates task details and filters', () => {
  const nodes = loadDemo('demo.html', {filter: 'regression'});
  assert.equal(nodes.get('rate').textContent, '75.0%');
  assert.equal(nodes.get('change').textContent, '-2.5 pp');
  assert.match(nodes.get('summary').textContent, /17 → 14/);
  nodes.get('chart').children[3].events.click();
  const filter = nodes.get('filter');
  filter.value = 'recovery';
  filter.events.change();
  assert.match(nodes.get('detail').textContent, /算术推理/);
  assert.equal(nodes.get('samples').innerHTML.match(/<tr>/g).length, 3);
});

test('global AI demo switches data and source by metric', () => {
  const nodes = loadDemo('global-ai.html', {metric: 'models'});
  assert.match(nodes.get('comparison').innerHTML, /value="40"/);
  assert.match(nodes.get('comparison').innerHTML, /research-and-development/);
  const select = nodes.get('metric');
  select.value = 'investment';
  select.events.change();
  assert.match(nodes.get('comparison').innerHTML, /value="109.08"/);
  assert.match(nodes.get('comparison').innerHTML, /hai_ai_index_report_2025.pdf/);
});
