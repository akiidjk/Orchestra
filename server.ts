import { createServer } from "node:http";
import next from "next";
import { WebSocketServer } from "ws";
import { handleConnection, listPublic } from "./lib/game/rooms";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (req.method === "GET" && req.url?.split("?")[0] === "/api/rooms") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(listPublic()));
      return;
    }
    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", handleConnection);
  const nextUpgrade = app.getUpgradeHandler();
  server.on("upgrade", (req, socket, head) => {
    if (req.url?.split("?")[0] === "/ws")
      wss.handleUpgrade(req, socket, head, (ws) =>
        wss.emit("connection", ws, req),
      );
    else if (dev) nextUpgrade(req, socket, head);
    else socket.destroy();
  });

  server.listen(port, () => console.log(`> Ready on http://localhost:${port}`));
});
