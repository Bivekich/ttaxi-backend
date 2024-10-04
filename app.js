const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bot = require("./services/botService");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

bot;
