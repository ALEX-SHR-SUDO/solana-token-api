const express = require("express");
const cors = require("cors");
const { Connection, Keypair, clusterApiUrl } = require("@solana/web3.js");
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} = require("@solana/spl-token");

const app = express();
app.use(cors());
app.use(express.json());

// Загружаем приватный ключ из Render Environment Variable
if (!process.env.PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY not set!");
  process.exit(1);
}

const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
const payer = Keypair.fromSecretKey(secretKey);

// Подключение к Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

app.get("/", (req, res) => {
  res.send("✅ Solana Token API is running!");
});

app.post("/create-token", async (req, res) => {
  try {
    const { decimals = 9, supply = 1000 } = req.body;

    // 1️⃣ Создаём новый mint
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      decimals,
      TOKEN_PROGRAM_ID
    );

    // 2️⃣ Создаём аккаунт владельца токена
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    // 3️⃣ Выпускаем указанное количество токенов на аккаунт владельца
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      supply
    );

    // 4️⃣ Возвращаем результат фронтенду
    res.json({
      success: true,
      mintAddress: mint.toBase58(),
      ownerAccount: tokenAccount.address.toBase58()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

