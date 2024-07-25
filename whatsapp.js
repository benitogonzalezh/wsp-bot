import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { buildMessage, saveQR } from "./utils.js";
import { GROUP_ID } from "./const.js";

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
  await sock.sendMessage(GROUP_ID, {
    text: messageToNotify,
  });
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
      if (message.key.remoteJid === GROUP_ID) return;

      const messageToNotify = buildMessage(message);
      await sendMessages(sock, messageToNotify)
    }
  });
}

export default connectToWhatsApp;
