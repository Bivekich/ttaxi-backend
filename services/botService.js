const TelegramBot = require("node-telegram-bot-api");
const { createUser } = require("../controllers/userController");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Добро пожаловать! Пожалуйста, отправьте ваш номер телефона.",
    {
      reply_markup: {
        keyboard: [
          [{ text: "Отправить номер телефона", request_contact: true }],
        ],
        one_time_keyboard: true,
      },
    }
  );
});

bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.contact.phone_number;

  try {
    await createUser(phoneNumber);
    bot.sendMessage(
      chatId,
      "Ваш номер успешно сохранен. Открыть мини-приложение",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть приложение",
                url: `${process.env.APP_URL}?phoneNumber=${phoneNumber}`,
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, "Произошла ошибка при сохранении номера.");
  }
});

module.exports = bot;
