const fs = require('fs');
const path = require('path');

// 1. Update Service Worker SW_VERSION timestamp in sw.js
const swPath = path.join(__dirname, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// Replace SW_VERSION line
const newSwContent = swContent.replace(
  /const SW_VERSION = ['"][^'"]+['"];/,
  `const SW_VERSION = '${timestamp}';`
);

if (newSwContent !== swContent) {
  fs.writeFileSync(swPath, newSwContent, 'utf8');
  console.log(`[Bump Version] Updated sw.js SW_VERSION to: ${timestamp}`);
} else {
  console.log(`[Bump Version] SW_VERSION already up to date: ${timestamp}`);
}

// 2. Increment semantic App Version in index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const versionRegex = /(<span class="info-meta-value" id="app-version-val">v?)(\d+)\.(\d+)(?:\.(\d+))?(<\/span>)/;
const match = indexContent.match(versionRegex);

if (match) {
  const prefix = match[1];
  let major = parseInt(match[2], 10);
  let minor = parseInt(match[3], 10);
  let patch = parseInt(match[4] || '0', 10);
  const suffix = match[5];

  const type = (process.argv[2] || 'patch').toLowerCase();
  if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  const newVersionStr = `${prefix}${major}.${minor}.${patch}${suffix}`;
  const newIndexContent = indexContent.replace(versionRegex, newVersionStr);

  fs.writeFileSync(indexPath, newIndexContent, 'utf8');
  console.log(`[Bump Version] Updated index.html App Version to: v${major}.${minor}.${patch}`);
} else {
  console.warn('[Bump Version] Could not find #app-version-val in index.html');
}

