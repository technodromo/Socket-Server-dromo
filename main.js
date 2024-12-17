const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static("public"));

// Crear un servidor HTTP
const server = http.createServer(app);

// Crear un servidor WebSocket sobre el servidor HTTP
const wss = new WebSocket.Server({ server });

// Manejar conexiones WebSocket
wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (message) => {
    console.log(`Mensaje recibido: ${message}`);
    ws.send(`Servidor recibió: ${message}`);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });

  ws.onerror = (error) => {
    console.error("Error en WebSocket:", error);
  };
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor WebSocket funcionando en Render!");
});

