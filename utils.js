import QRCode from "qrcode";
import fs from "fs";

export const getNumbersFromEnv = () => {
  const numbers = process.env.NUMBERS_TO_NOTIFY;
  if (!numbers) throw new Error("Please provide NUMBERS in env");
  return numbers.split(",").map((n) => n.trim()).map(n => n.replace('+', ''));
}

export const saveQR = async (qr) => {
  const qrImage = await QRCode.toDataURL(qr);

  const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
  fs.writeFile("qr_code.png", base64Data, 'base64', function (err) {
    if (err) console.log(err);
    console.log("QR code image saved as qr_code.png");
  });
}

export const buildMessage = (message) => {
  const number = message.key.remoteJid.split("@")[0];
  const name = message.pushName;
  const sender = name ? `${name} (${number})` : number;
  const messageText =
    message.message.conversation ||
    message.message.extendedTextMessage.text;

  return `Nuevo mensaje de ${sender}:\n${messageText}`.trim();
}