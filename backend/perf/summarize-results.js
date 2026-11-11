// Turns a JMeter HTML-dashboard statistics.json into a short Markdown summary for the evidence folder.
// Usage: node perf/summarize-results.js <statistics.json> <output.md> "<run description>"
const fs = require('fs');

const [statsPath, outPath, description = ''] = process.argv.slice(2);
if (!statsPath || !outPath) {
  console.error('Usage: node perf/summarize-results.js <statistics.json> <output.md> "<run description>"');
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
const ms = (v) => `${Math.round(v)} ms`;
const rows = Object.values(stats).map(
  (s) =>
    `| ${s.transaction} | ${s.sampleCount} | ${s.errorCount} (${s.errorPct.toFixed(2)}%) | ${ms(s.meanResTime)} | ${ms(s.medianResTime)} | ${ms(s.pct1ResTime)} | ${ms(s.pct2ResTime)} | ${ms(s.pct3ResTime)} | ${ms(s.maxResTime)} | ${s.throughput.toFixed(1)}/s |`
);

const total = stats.Total;
const target = 3000;
const verdict =
  total.pct1ResTime <= target && total.errorCount === 0
    ? `PASS: p90 ${ms(total.pct1ResTime)} is within the ${target / 1000} s target (OEP-NF-001) with 0 failed requests.`
    : `FAIL: p90 ${ms(total.pct1ResTime)} against the ${target / 1000} s target, ${total.errorCount} failed requests.`;

const md = [
  '| Request | Samples | Errors | Mean | Median | p90 | p95 | p99 | Max | Throughput |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...rows,
  '',
  `**Result:** ${verdict}`,
  '',
  description
].join('\n');

fs.writeFileSync(outPath, md + '\n');
console.log(md);
