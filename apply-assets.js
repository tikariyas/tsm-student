const fs = require('fs'), path = require('path');
const res = 'android/app/src/main/res';
if (fs.existsSync(res)) {
  fs.cpSync('icons', res, { recursive: true, force: true });
  (function walk(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name === 'splash.png') fs.copyFileSync('splash.png', p);
    }
  })(res);
  console.log('TSM icon and splash applied');
}

const mf = 'android/app/src/main/AndroidManifest.xml';
if (fs.existsSync(mf)) {
  let x = fs.readFileSync(mf, 'utf8');
  if (!x.includes('android.permission.CAMERA')) {
    x = x.replace('</manifest>', '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>');
    fs.writeFileSync(mf, x);
    console.log('Camera permission added');
  }
}

const bg = 'android/app/build.gradle';
if (fs.existsSync(bg)) {
  let g = fs.readFileSync(bg, 'utf8');
  const run = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10) + 1;
  g = g.replace(/versionCode\s+\d+/, 'versionCode ' + run).replace(/versionName\s+"[^"]*"/, 'versionName "1.' + run + '"');
  fs.writeFileSync(bg, g);
  console.log('versionCode set to ' + run);
}
