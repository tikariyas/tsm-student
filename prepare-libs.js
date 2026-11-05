const fs = require('fs');
fs.mkdirSync('www/lib', { recursive: true });
const cp = (a, b) => fs.copyFileSync(a, 'www/lib/' + b);
cp('node_modules/jspdf/dist/jspdf.umd.min.js', 'jspdf.umd.min.js');
const qp = require('./node_modules/qrcode-generator/package.json');
cp('node_modules/qrcode-generator/' + (qp.main || 'qrcode.js'), 'qrcode.js');
['app', 'auth', 'firestore'].forEach(n => cp('node_modules/firebase/firebase-' + n + '-compat.js', 'firebase-' + n + '-compat.js'));
console.log('libraries copied');
