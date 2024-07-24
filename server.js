import express from 'express';
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/qr', (_, res) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(__dirname, 'qr_code.png');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.send('QR code not generated yet. Please wait...');
  }
});

export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}