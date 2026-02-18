import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;
const FASTAPI_URL = process.env.FASTAPI_URL;

app.use(cors());
app.use(express.json());

app.get("/api/fastapi", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "FastAPI not reachable" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
