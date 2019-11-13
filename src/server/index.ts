import express from "express";
import path from "path";
import url from "url";

const port = process.env["PORT"] || 3000;

const server = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const frontEnd = path.join(__dirname, "..", "frontend");
const index = path.join(frontEnd, "index.html");
const nodeModules = path.join(__dirname, "..", "..", "node_modules");

server.use((req, res, next) => {
  console.log("Request for", req.url, "received at", Date.now());
  next();
});

server.use(express.static(frontEnd, { extensions: ["mjs"] }));
server.get("/preact", (req, res) =>
  res.sendFile(path.join(nodeModules, "preact", "dist", "preact.module.js"))
);
server.get("/d3", (req, res) =>
  res.sendFile(path.join(nodeModules, "d3", "dist", "d3.min.js"))
);
server.get("/", (req, res) => res.sendFile(index));

server.listen(port, () => console.log("server listening on port", port));
