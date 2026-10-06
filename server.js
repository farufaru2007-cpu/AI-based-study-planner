// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var defaultPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
var distPath = path.resolve(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});
app.get("*", (_req, res) => {
  const indexPath = path.resolve(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Application build not found. Please run npm run build.");
  }
});
var startServer = (port) => {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && port !== 3e3) {
      console.warn(`Port ${port} in use, falling back to port 3000...`);
      startServer(3e3);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
};
startServer(defaultPort);
