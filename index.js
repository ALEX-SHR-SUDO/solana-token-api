const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// тестовый эндпоинт
app.get("/", (req, res) => {
  res.send("✅ Solana Token API is working!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
