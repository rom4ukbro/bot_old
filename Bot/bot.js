const {
  Telegraf,
  Scenes: { Stage },
  session,
} = require('telegraf');

const moment = require('moment');
moment.locale('uk');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { User } = require('../DB/connect.js');
const { clearHistory, updateInfo } = require('./text.js');

const welcomeScene = require('./Scene/welcomeScene.js');
const progressScene = require('./Scene/progressScene');
const chooseScene = require('./Scene/chooseScene.js');
const { studentScene, teacherScene } = require('./Scene/selectScene');
const { scheduleScene, writeDateScene } = require('./Scene/scheduleScene');
const {
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
} = require('./Scene/adminScene');
const { cbScene } = require('./Scene/cbScene.js');

//
//

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const stage = new Stage([
  progressScene,
  welcomeScene,
  chooseScene,
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
try {
  bot.use(session());
  bot.use(stage.middleware());

  // mailing();

  bot.command('start', async (ctx) => {
    ctx.session.id = [];

    if (
      ctx.message.chat?.type == 'supergroup' ||
      ctx.message.chat?.type == 'group' ||
      ctx.message.chat?.type == 'chanel'
    ) {
      return ctx.reply(`Я не працюю в ${ctx.message.chat?.type}`);
    }

    User.upsert(
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
    )
      .then((res) => {})
      .catch((err) => {});

    ctx.session.weekShift = 0;

    await ctx.scene.enter('welcomeScene');

    ctx.session.id = ctx.message.message_id;

    for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
    ctx.deleteMessage(ctx.session.oneMessegeId).catch((err) => {});
  });

  bot.command('admin', (ctx) => {
    ctx.scene.enter('logInAdminScene');

    ctx.session.id = ctx.message.message_id;
    for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  });

  bot.action('del', (ctx) => {
    ctx.deleteMessage(ctx.update.callback_query.message.message_id);
  });

  bot.action('cbScene', (ctx) => {
    ctx.scene.enter('cbScene');
  });

  bot.on('dice', async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id);
    ctx;
  });

  bot.on('message', async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id);
    ctx;
  });

  bot.launch();
} catch (e) {
  console.log(e);
}

async function mailing() {
  ids = [];
  User.findAll()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        const el = result[i].dataValues.id;
        ids.push(el);
      }
      if (ids.length != 0) {
        for (let n = 0; n < ids.length; n++) {
          const element = ids[n];

          bot.telegram.sendMessage(element, updateInfo + '\n\n' + clearHistory).catch((err) => {});
        }
      }
    })
    .catch((err) => {});
}

module.exports = { bot };
