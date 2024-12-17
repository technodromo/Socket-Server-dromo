const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const app = express();

// Configuración de puerto
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static("public"));

// Crear servidor HTTP
const server = http.createServer(app);

// Servidor WebSocket usando el mismo servidor HTTP
const wss = new WebSocket.Server({ server });

server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

let keepAliveId;

// Función de keepalive para mantener las conexiones activas
const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("ping");
      }
    });
  }, 50000);
};

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  if (wss.clients.size === 1) {
    console.log("Primera conexión: Iniciando keepalive");
    keepServerAlive();
  }

  ws.on("message", (data) => {
    const message = data.toString();
    console.log("Mensaje recibido:", message);

    if (message === "pong") {
      console.log("Respuesta keepalive recibida");
      return;
    }

    // Broadcast del mensaje
    broadcast(ws, message, false);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");

    if (wss.clients.size === 0) {
      console.log("Último cliente desconectado. Deteniendo keepalive.");
      clearInterval(keepAliveId);
    }
  });
});

// Función de broadcast
const broadcast = (ws, message, includeSelf) => {
  wss.clients.forEach((client) => {
    if ((includeSelf || client !== ws) && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor WebSocket funcionando en Render!");
});

