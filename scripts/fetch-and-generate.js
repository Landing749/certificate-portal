const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// Load Firebase service account from GitHub secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://certificates-portal-84366-default-rtdb.firebaseio.com"
});

const db = admin.database();

function generateCertificateHTML({ name, award, committee, date }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate for ${name}</title>
  <style>
    body { font-family: Georgia, serif; background: #fdfdfb; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .certificate { width: 800px; padding: 40px; border: 10px solid #d4af37; border-radius: 12px; background: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-align: center; }
    h1 { font-size: 2.5em; margin-bottom: 10px; }
    h2 { font-size: 2em; color: #d4af37; margin: 20px 0; }
    p { font-size: 1.2em; margin: 10px 0; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature div { border-top: 1px solid #333; width: 40%; text-align: center; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>Certificate of Achievement</h1>
    <p>This certificate is proudly presented to</p>
    <h2>${name}</h2>
    <p>${award}</p>
    <div class="signature">
      <div>${committee}</div>
      <div>${date}</div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const snapshot = await db.ref("certificates").once("value");
  const certs = snapshot.val() || {};

  const outDir = path.join(__dirname, "..", "certificates");
  fs.mkdirSync(outDir, { recursive: true });

  for (const [id, data] of Object.entries(certs)) {
    const html = generateCertificateHTML(data);
    const filePath = path.join(outDir, `cert-${id}.html`);
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`✅ Generated: ${filePath}`);
  }
}

main().then(() => process.exit(0));
