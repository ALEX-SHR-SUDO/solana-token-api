const express = require("express");
const cors = require("cors");
const { Connection, Keypair, clusterApiUrl } = require("@solana/web3.js");
const { createMint } = require("@solana/spl-token");

const app = express();
app.use(cors());
app.use(express.json());

// Загружаем приватный ключ из Render
const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
const payer = Keypair.fromSecretKey(secretKey);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

app.get("/", (req, res) => {
  res.send("✅ Solana Token API is running!");
});

app.post("/create-token", async (req, res) => {
  try {
    const { decimals } = req.body;

    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      decimals || 9
    );

    res.json({
      success: true,
      mintAddress: mint.toBase58()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
