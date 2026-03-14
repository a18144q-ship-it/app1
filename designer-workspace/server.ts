import express from "express";
import { createServer } from "http";
import { ExpressPeerServer } from "peer";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const PORT = 3000;

  // Set up PeerJS server
  const peerServer = ExpressPeerServer(httpServer, {
    path: "/myapp",
    allow_discovery: true,
  });

  app.use("/peerjs", peerServer);

  peerServer.on('connection', (client) => {
    console.log('Peer connected:', client.getId());
  });

  peerServer.on('disconnect', (client) => {
    console.log('Peer disconnected:', client.getId());
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
