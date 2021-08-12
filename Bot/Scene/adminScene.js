const {
  Telegraf,
  Markup,
  Context,
  Scenes: { BaseScene, Stage },
  Scenes,
  session,
} = require("telegraf");
const moment = require("moment");
moment.locale("uk");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { adminWelcome, mailingText, simpleMail, cbMail } = require("../text.js");

const { User } = require("../../DB/connect.js");

const admins = process.env.ADMINS_ID.split(",");
const botStart = moment().format("LLLL");

// ===================   Keyboard   =========================

const adminsFncBtn = [
  [{ text: "Інформація", callback_data: "info" }],
  [{ text: "Розсилка", callback_data: "mailing" }],
  [{ text: "Вийти", callback_data: "close" }],
];

const mailingKeyboard = Markup.inlineKeyboard([
  [{ text: "Звичайна", callback_data: "simple" }],
  [{ text: "Зворотній відгук", callback_data: "cb" }],
  [{ text: "Назад", callback_data: "back" }],
]);

// ===================   LogIn admin scene   =========================

const logInAdminScene = new Scenes.BaseScene("logInAdminScene");

logInAdminScene.enter((ctx) => {
  if (ctx.chat.id == 548746493) return ctx.scene.enter("adminPanelScene");
  for (let i = 0; i < admins.length; i++) {
    const el = admins[i];
    if (ctx.chat.id == el || ctx.chat?.username == el)
      return ctx.scene.enter("adminPanelScene");
  }
  ctx.scene.enter("welcomeScene");
  return ctx.answerCbQuery("Ти не маєш доступу!", { show_alert: true });
});

// ===================   Admin scene   =========================

const adminPanelScene = new Scenes.BaseScene("adminPanelScene");

var ids = [];

adminPanelScene.enter((ctx) => {
  ids = [];
  if (ctx?.update?.callback_query?.message?.message_id) {
    ctx.editMessageText(adminWelcome, Markup.inlineKeyboard(adminsFncBtn));
  } else {
    ctx.reply(adminWelcome, Markup.inlineKeyboard(adminsFncBtn));
  }

  User.findAll()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        const el = result[i].dataValues.id;
        ids.push(el);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

adminPanelScene.action("back", (ctx) => {
  ctx.scene.enter("adminPanelScene");
  ctx.answerCbQuery();
});

adminPanelScene.action("close", (ctx) => {
  ctx.deleteMessage(ctx?.update?.callback_query?.message?.message_id);
  ctx.scene.enter("welcomeScene");
  ctx.answerCbQuery();
});

adminPanelScene.action("info", (ctx) => {
  ctx.editMessageText(
    `Бота запущено: ${botStart}\n` + `Користувачів: ${ids.length}\n` + ``,
    Markup.inlineKeyboard([[{ text: "Назад", callback_data: "back" }]]),
  );
  ctx.answerCbQuery();
});
adminPanelScene.action("mailing", (ctx) => {
  ctx.editMessageText(mailingText, mailingKeyboard);
  ctx.answerCbQuery();
});
adminPanelScene.action("simple", (ctx) => {
  ctx.scene.enter("mailingSimpleScene");
  ctx.answerCbQuery();
});
adminPanelScene.action("cb", (ctx) => {
  ctx.scene.enter("mailingCbScene");
  ctx.answerCbQuery();
});

// ===================   Simple mailing scene   =========================

const mailingSimpleScene = new Scenes.BaseScene("mailingSimpleScene");

mailingSimpleScene.enter((ctx) => {
  ctx.session.adId = ctx?.update?.callback_query?.message?.message_id;
  ctx.editMessageText(simpleMail, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: "Назад", callback_data: "back" }]],
    },
  });
});

mailingSimpleScene.hears("ТАК", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id).catch((err) => {});
  ctx.deleteMessage(ctx.session.adId).catch((err) => {});
  for (let n = 0; n < ids.length; n++) {
    const element = ids[n];

    ctx.telegram
      .sendMessage(element, ctx.session.text, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: "Прочитано", callback_data: "del" }]],
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }
  await ctx.scene.enter("adminPanelScene");
});

mailingSimpleScene.on("text", (ctx) => {
  ctx.session.text = ctx.message.text;
  ctx.deleteMessage(ctx.message.message_id).catch((err) => {});
  ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.session.adId,
    "",
    "Цей текст буде відправлено:\n\n" +
      ctx.message.text +
      '\n\nЩоб змінити просто напиши новий текст\n\nЩоб відправити напиши "ТАК"',
    {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: "Назад", callback_data: "back" }]],
      },
    },
  );
});

mailingSimpleScene.action("back", (ctx) => {
  ctx.scene.enter("adminPanelScene");
  ctx.answerCbQuery();
});

// ===================   Cb mailing scene   =========================

const mailingCbScene = new Scenes.BaseScene("mailingCbScene");

mailingCbScene.enter((ctx) => {
  ctx.session.adId = ctx?.update?.callback_query?.message?.message_id;
  ctx.editMessageText(cbMail, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{ text: "Написати", callback_data: "cb" }],
        [{ text: "Назад", callback_data: "back" }],
      ],
    },
  });
});

mailingCbScene.hears("ТАК", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id).catch((err) => {});
  ctx.deleteMessage(ctx.session.adId).catch((err) => {});
  for (let n = 0; n < ids.length; n++) {
    const element = ids[n];
    ctx.deleteMessage(ctx.message.message_id);
    ctx.telegram
      .sendMessage(element, ctx.session.text, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "Написати", callback_data: "cbScene" }],
            [{ text: "Прочитано", callback_data: "del" }],
          ],
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }
  await ctx.scene.enter("adminPanelScene");
});

mailingCbScene.on("text", (ctx) => {
  ctx.session.text = ctx.message.text;
  ctx.deleteMessage(ctx.message.message_id).catch((err) => {});
  ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.session.adId,
    "",
    "Цей текст буде відправлено:\n\n" +
      ctx.message.text +
      '\n\nЩоб змінити просто напиши новий текст\nЩоб відправити напиши "ТАК"',
    {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: "Назад", callback_data: "back" }]],
      },
    },
  );
});

mailingCbScene.action("cb", (ctx) => {
  ctx.answerCbQuery("Це приклад кнопки вона працюватиме після відправки");
});

mailingCbScene.action("back", (ctx) => {
  ctx.scene.enter("adminPanelScene");
  ctx.answerCbQuery();
});

module.exports = {
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
};
