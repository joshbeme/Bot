const http = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const { Worker } = require("worker_threads");
const path = require("path");
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocket.Server({ noServer: true });
  let worker;

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const data = JSON.parse(message);

      if (data.command === "start") {
        console.log("Starting worker thread");
        if (worker) worker.terminate();
        worker = new Worker(
          path.join(__dirname, "src", "temu-bot", "index.js"),
          { workerData: data.payload }
        );

        // Worker thread events
        worker.on("online", () => {
          ws.send(
            JSON.stringify({
              message: "Worker thread is online",
              status: "online",
            })
          );
        });
        worker.on("message", (msg) => {
          ws.send(msg);
        });
        worker.on("exit", (code) => {
          ws.send(
            JSON.stringify({
              message: "Worker thread has exited",
              status: "offline",
              payload: code,
            })
          );
        });
      } else if (data.command === "stop") {
        if (worker) {
          worker.postMessage("stop");

          ws.send("Worker thread has been terminated");
        }
      }
    });

    ws.send(
      JSON.stringify({
        message: "WebSocket connection established",
        status: "initialized",
      })
    );
  });

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("Listening on http://localhost:3000");
  });
});
