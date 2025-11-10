// ===== backend/server.js =====
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// === Path setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "./");
app.use(express.static(frontendPath));

// ====== DATA IN-MEMORY ======
let users = [];
let sessions = {}; // token -> username
let devices = [];
let qcList = [];

// ====== HELPER ======
const success = (data, message) => ({ success: true, message, data });
const failure = (message) => ({ success: false, error: message });

// ====== AUTH ROUTES ======
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json(failure("Semua field wajib diisi"));

  if (users.find(u => u.username === username))
    return res.status(400).json(failure("Username sudah terdaftar"));

  users.push({ username, password });
  res.json(success(null, `User ${username} berhasil terdaftar`));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user)
    return res.status(401).json(failure("Username atau password salah"));

  const token = Math.random().toString(36).substring(2);
  sessions[token] = username;
  res.json(success({ token }, `Login berhasil sebagai ${username}`));
});

app.post("/logout", (req, res) => {
  const token = req.headers.authorization;
  if (sessions[token]) delete sessions[token];
  res.json(success(null, "Berhasil logout"));
});

// ====== AUTH MIDDLEWARE ======
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) {
    return res.status(401).json(failure("Token tidak valid atau belum login"));
  }
  req.username = sessions[token];
  next();
}

// ====== DEVICE ROUTES ======
app.post("/devices", auth, (req, res) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId || !deviceName)
    return res.status(400).json(failure("Semua field wajib diisi"));

  const exists = devices.find(d => d.deviceId === deviceId);
  if (exists)
    return res.status(400).json(failure(`Device ${deviceId} sudah terdaftar`));

  const newDevice = { deviceId, deviceName, addedBy: req.username };
  devices.push(newDevice);
  res.status(201).json(success(newDevice, `Device ${deviceId} berhasil ditambahkan`));
});

app.post("/qc", auth, (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId)
    return res.status(400).json(failure("Device ID wajib diisi"));

  const found = devices.find(d => d.deviceId === deviceId);
  if (!found)
    return res.status(400).json(failure(`Device ${deviceId} belum terdaftar`));

  if (qcList.includes(deviceId))
    return res.status(400).json(failure(`Device ${deviceId} sudah QC sebelumnya`));

  qcList.push(deviceId);
  res.json(success({ deviceId, status: "QC OK" }, `Device ${deviceId} dinyatakan QC OK`));
});

app.get("/devices", auth, (req, res) => {
  res.json(success(devices, "Daftar semua device"));
});

app.get("/qc", auth, (req, res) => {
  const qcDevices = devices.filter(d => qcList.includes(d.deviceId));
  res.json(success(qcDevices, "Daftar device QC OK"));
});

app.delete("/reset", auth, (req, res) => {
  devices = [];
  qcList = [];
  res.json(success(null, "Semua data berhasil direset"));
});

// === Route utama tampilkan login.html ===
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// === Error handler ===
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json(failure("Terjadi kesalahan server"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
);
