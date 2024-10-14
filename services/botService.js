const TelegramBot = require("node-telegram-bot-api");
const { createUser } = require("../controllers/userController");
const { isAdmin } = require("../controllers/adminController");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const adminRequests = new Map();

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

bot.onText(/\/admin/, (msg) => {
  const chatId = msg.chat.id;
  adminRequests.set(chatId, true);
  bot.sendMessage(
    chatId,
    "Пожалуйста, отправьте ваш номер телефона для проверки прав администратора",
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

  if (adminRequests.has(chatId)) {
    adminRequests.delete(chatId);
    try {
      const adminAccess = await isAdmin(phoneNumber);
      if (adminAccess) {
        bot.sendMessage(
          chatId,
          "У вас есть доступ к админ-панели. Открыть мини-приложение",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Открыть админ-приложение",
                    url: `${process.env.ADMIN_APP_URL}?phoneNumber=${phoneNumber}`,
                  },
                ],
              ],
            },
          }
        );
      } else {
        bot.sendMessage(chatId, "У вас нет прав администратора.");
      }
    } catch (error) {
      bot.sendMessage(
        chatId,
        "Произошла ошибка при проверке прав администратора."
      );
    }
  } else {
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
  }
});

module.exports = bot;
