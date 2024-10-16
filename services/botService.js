const TelegramBot = require("node-telegram-bot-api");
const { createUser } = require("../controllers/userController");
const { isAdmin } = require("../controllers/adminController");
const { isDriver } = require("../controllers/driverController"); // Assuming you have a driver controller

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const adminRequests = new Map();
const driverRequests = new Map(); // Map to handle driver requests

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

// New /driver command
bot.onText(/\/driver/, (msg) => {
  const chatId = msg.chat.id;
  driverRequests.set(chatId, true); // Store the driver request
  bot.sendMessage(
    chatId,
    "Пожалуйста, отправьте ваш номер телефона для проверки прав водителя",
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
  const sanitizedPhoneNumber = phoneNumber.startsWith("+")
    ? phoneNumber.slice(1)
    : phoneNumber;
  // Check if the user is requesting admin access
  if (adminRequests.has(chatId)) {
    adminRequests.delete(chatId); // Remove from admin requests
    try {
      const adminAccess = await isAdmin(sanitizedPhoneNumber);
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
                    url: `${process.env.ADMIN_APP_URL}?phoneNumber=${sanitizedPhoneNumber}`,
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
    return;
  }

  // Check if the user is requesting driver access
  if (driverRequests.has(chatId)) {
    driverRequests.delete(chatId); // Remove from driver requests
    try {
      const driverAccess = await isDriver(sanitizedPhoneNumber); // Check driver access
      if (driverAccess) {
        bot.sendMessage(
          chatId,
          "У вас есть доступ к приложению водителя. Открыть мини-приложение",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Открыть приложение водителя",
                    url: `${process.env.DRIVER_APP_URL}?phoneNumber=${sanitizedPhoneNumber}`,
                  },
                ],
              ],
            },
          }
        );
      } else {
        bot.sendMessage(chatId, "У вас нет прав водителя.");
      }
    } catch (error) {
      bot.sendMessage(chatId, "Произошла ошибка при проверке прав водителя.");
    }
    return;
  }

  // Default case: creating a user if neither admin nor driver
  try {
    await createUser(sanitizedPhoneNumber);
    bot.sendMessage(
      chatId,
      "Ваш номер успешно сохранен. Открыть мини-приложение",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть приложение",
                url: `${process.env.APP_URL}?phoneNumber=${sanitizedPhoneNumber}`,
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
