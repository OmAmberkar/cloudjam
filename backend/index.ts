import express from "express";
import cors from "cors";
import multer from "multer";
import * as xlsx from "xlsx";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory store for leaderboard data
let leaderboardData: any[] = [];

// Admin Auth
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "gdgcace@gmail.com" && password === "gdgcisallaboutfamily") {
    // In a real app we'd use JWTs, but for this simple app setting a token is enough
    return res.json({ success: true, token: "admin-token-123" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Configure Multer for in-memory file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Endpoint
app.post("/api/leaderboard/upload", upload.single("file"), (req, res) => {
  const token = req.headers.authorization;
  if (token !== "Bearer admin-token-123") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    leaderboardData = data;
    console.log(`Parsed ${data.length} rows from uploaded file.`);
    
    return res.json({ success: true, message: "File parsed successfully", rowCount: data.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error parsing Excel file" });
  }
});

// Get Leaderboard Data
app.get("/api/leaderboard", (req, res) => {
  res.json({ success: true, data: leaderboardData });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
