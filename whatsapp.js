import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { buildMessage, getNumbersFromEnv, saveQR } from "./utils.js";

const numbersToNotify = getNumbersFromEnv();
const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

function handleCloseConnection(lastDisconnect) {
  const shouldReconnect =
    lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

  console.log(
    "connection closed due to ",
    lastDisconnect.error,
    ", reconnecting ",
    shouldReconnect
  );
  // reconnect if not logged out
  if (shouldReconnect) {
    connectToWhatsApp();
  }
}

async function sendMessages(sock, messageToNotify) {
  for (const number of numbersToNotify) {
    await sock.sendMessage(number + "@s.whatsapp.net", {
      text: messageToNotify,
    });
  }
}

async function connectToWhatsApp() {
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: false,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) await saveQR(qr);
    if (connection === "close") handleCloseConnection(lastDisconnect);
    else if (connection === "open") console.log("opened connection");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    console.log('messages', messages);
    for (const message of messages) {
      // ignore messages sent by me
      if (message?.key?.fromMe) return;

      const messageToNotify = buildMessage(message);
      await sendMessages(sock, messageToNotify)
    }
  });
}

export default connectToWhatsApp;
