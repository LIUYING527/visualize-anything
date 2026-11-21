'use strict';

const fs = require('node:fs');
const path = require('node:path');

try {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node read-viziverse-metrics.cjs input-file');
  }
  const parserPath = path.resolve(__dirname, '../../../../viewer/import-parser.js');
  if (!fs.existsSync(parserPath)) {
    throw new Error('Run this integration from the skill bundled with the Visualize Anything repository.');
  }
  const {parseImportedText} = require(parserPath);
  const input = process.argv[2];
  const events = parseImportedText(fs.readFileSync(input, 'utf8'), path.basename(input));
  const observations = events.filter(event =>
    event.type === 'metric' && typeof event.data?.name === 'string' && Number.isFinite(event.data.value)
  ).map(event => ({
    runId: event.run_id ?? null,
    runName: event.run_name ?? null,
    name: event.data.name,
    value: event.data.value,
    split: event.data.split ?? null,
    step: event.data.step ?? event.step ?? null,
    epoch: event.data.epoch ?? null,
    unit: event.data.unit ?? null
  }));
  console.log(JSON.stringify({observations, skippedEvents: events.length - observations.length}, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
