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

const { User } = require("../DB/connect.js");
const { clearHistory, updateInfo } = require("./text.js");

const welcomeScene = require("./Scene/welcomeScene.js");
const { studentScene, teacherScene } = require("./Scene/selectScene");
const { scheduleScene, writeDateScene } = require("./Scene/scheduleScene");
const {
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
} = require("./Scene/adminScene");
const { cbScene } = require("./Scene/cbScene.js");

//
//

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const stage = new Stage([
  welcomeScene,
  studentScene,
  teacherScene,
  scheduleScene,
  writeDateScene,
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
  cbScene,
]);

const bot = new Telegraf(token);
bot.use(session());
bot.use(stage.middleware());

var ids = [];

User.findAll()
  .then((result) => {
    for (let i = 0; i < result.length; i++) {
      const el = result[i].dataValues.id;
      ids.push(el);
    }
    if (ids.length != 0) {
      for (let n = 0; n < ids.length; n++) {
        const element = ids[n];

        bot.telegram
          .sendMessage(element, updateInfo + "\n\n" + clearHistory)
          .catch((err) => {
            console.log(err);
          });

        if (element == "762348663") {
          bot.telegram.sendMessage(element, "Я тебе кохаю");
        }
      }
    }
  })
  .catch((err) => {});

bot.command("start", async (ctx) => {
  ctx.session.id = [];

  User.findAll({
    where: {
      id: ctx.chat.id,
    },
  })
    .then((result) => {
      if (result.length == 0) {
        User.create(
          {
            id: ctx.chat.id,
            firstName: ctx.chat.first_name,
            lastName: ctx.chat?.last_name,
            userName: ctx.chat?.username,
          },
          {
            ignoreDuplicates: false,
            onDuplicate: false,
          },
        );
      }
    })
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });

  ctx.session.weekShift = 0;

  await ctx.scene.enter("welcomeScene");

  ctx.session.id = ctx.message.message_id;

  for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
    ctx.deleteMessage(i).catch((err) => {});
  }
  ctx.deleteMessage(ctx.session.oneMessegeId).catch((err) => {});
});

bot.command("admin", (ctx) => {
  ctx.scene.enter("logInAdminScene");

  ctx.session.id = ctx.message.message_id;
  for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
    ctx.deleteMessage(i).catch((err) => {});
  }
});

bot.action("del", (ctx) => {
  ctx.deleteMessage(ctx.update.callback_query.message.message_id);
});

bot.action("cbScene", (ctx) => {
  ctx.scene.enter("cbScene");
});

bot.on("message", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id);
  ctx;
});

bot.launch();

module.exports = { bot };
