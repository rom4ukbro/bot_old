const {
  Telegraf,
  Markup,
  Scenes: { Stage },
  session,
} = require('telegraf');

const moment = require('moment');
moment.locale('uk');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { Users } = require('../DB/connect.js');

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
  mailingUpdateScene,
} = require('./Scene/adminScene');
const { defaultValueScene } = require('./Scene/defaultValueScene');
const { cbScene } = require('./Scene/cbScene.js');
const { statementScene } = require('./Scene/statementScene/statementScene');
const { statement1Scene } = require('./Scene/statementScene/statement1Scene');
const { statement2Scene } = require('./Scene/statementScene/statement2Scene');
const { statement3Scene } = require('./Scene/statementScene/statement3Scene');
const { statement4Scene } = require('./Scene/statementScene/statement4Scene');
const { statement5Scene } = require('./Scene/statementScene/statement5Scene');
const { statement6Scene } = require('./Scene/statementScene/statement6Scene');
const { statement7Scene } = require('./Scene/statementScene/statement7Scene');

const {
  resetDefaultValueText,
  nextWeekText,
  todayText,
  previousWeekText,
  manualDateBtnEntry,
  changeQueryBtnText,
  allWeekBtnText,
  mainMenu,
} = require('./text');

const http = require('../server');

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
  defaultValueScene,
  mailingUpdateScene,
  statementScene,
  statement1Scene,
  statement2Scene,
  statement3Scene,
  statement4Scene,
  statement5Scene,
  statement6Scene,
  statement7Scene,
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

    await Users.findOneAndUpdate(
      { _id: ctx.from.id },
      {
        _id: ctx.from.id,
        name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    )
      .clone()
      .then(async (result) => {
        ctx.session.default_value = result?.default_value;
        ctx.session.default_role = result?.default_role;
        ctx.session.weekShift = 0;

        await ctx.scene.enter('welcomeScene');

        ctx.session.id = ctx.message.message_id;

        for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
          ctx.deleteMessage(i).catch((err) => {});
        }
        ctx.deleteMessage(ctx.session.oneMessegeId).catch((err) => {});
      })
      .catch((err) => {
        ctx.reply(
          'Щось пішло не так, спробуй ще(/start) раз або звернися по допомогу до творця бота',
        );
        console.log(err);
      });
  });

  bot.command('admin', (ctx) => {
    try {
      ctx.scene.enter('logInAdminScene');

      ctx.session.id = ctx.message.message_id;
      for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
        ctx.deleteMessage(i).catch((err) => {});
      }
    } catch (e) {
      console.log(e);
    }
  });

  bot.command('reset', (ctx) => {
    try {
      ctx.deleteMessage(ctx.message.message_id);
      if (!!ctx.session?.oneMessegeId)
        ctx.telegram
          .editMessageText(
            ctx.from.id,
            ctx.session.oneMessegeId,
            '',
            resetDefaultValueText,
            Markup.inlineKeyboard([
              [{ text: 'Так', callback_data: 'reset_yes' }],
              [{ text: 'Ні', callback_data: 'reset_no' }],
            ]),
          )
          .catch((err) => {});
      else
        ctx.reply(
          resetDefaultValueText,
          Markup.inlineKeyboard([
            [{ text: 'Так', callback_data: 'reset_yes' }],
            [{ text: 'Ні', callback_data: 'reset_no' }],
          ]),
        );

      ctx.session.id = ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id;
      for (i = ctx.session.id - 100; i < ctx.session.id; i++) {
        if (i != ctx.session.oneMessegeId) ctx.deleteMessage(i).catch((err) => {});
      }
    } catch (e) {
      console.log(e);
    }
  });

  bot.action('reset_yes', async (ctx) => {
    Users.findOneAndUpdate(
      { _id: ctx.from.id },
      {
        default_value: null,
        default_role: null,
      },
    )
      .clone()
      .then((value) => {
        ctx.answerCbQuery('Все пройшло успішно!\nЗаповни нові дані', { show_alert: true });
        ctx.scene.enter('defaultValueScene');
      })
      .catch((err) => {
        console.log(err);
      });
  });

  bot.action('reset_no', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('welcomeScene');
  });

  bot.action('cbScene', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('cbScene');
  });

  bot.on('message', async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id);
    ctx;
  });

  bot.action('Пн', (ctx) => {
    ctx.session.day = 'Пн';
    oneReaction(ctx);
  });

  bot.action('Вт', (ctx) => {
    ctx.session.day = 'Вт';
    oneReaction(ctx);
  });

  bot.action('Ср', (ctx) => {
    ctx.session.day = 'Ср';
    oneReaction(ctx);
  });

  bot.action('Чт', (ctx) => {
    ctx.session.day = 'Чт';
    oneReaction(ctx);
  });

  bot.action('Пт', (ctx) => {
    ctx.session.day = 'Пт';
    oneReaction(ctx);
  });

  bot.action('Сб', (ctx) => {
    ctx.session.day = 'Сб';
    oneReaction(ctx);
  });

  bot.action('Нд', (ctx) => {
    ctx.session.day = 'Нд';
    oneReaction(ctx);
  });

  bot.action(previousWeekText, (ctx) => {
    oneReaction(ctx);
  });

  bot.action(nextWeekText, (ctx) => {
    oneReaction(ctx);
  });

  bot.action(todayText, (ctx) => {
    oneReaction(ctx);
  });

  bot.action(mainMenu, (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('welcomeScene');
  });

  bot.action(changeQueryBtnText, (ctx) => {
    oneReaction(ctx);
  });

  bot.action(manualDateBtnEntry, (ctx) => {
    oneReaction(ctx);
  });

  bot.action(allWeekBtnText, (ctx) => {
    oneReaction(ctx);
  });
  bot.action('📌', (ctx) => {
    oneReaction(ctx);
  });

  bot.launch();
} catch (e) {
  console.log();
}

function oneReaction(ctx) {
  ctx.session.time = 0;
  Users.findById(ctx.from.id)
    .then((result) => {
      ctx.answerCbQuery();

      ctx.session.oneMessegeId = ctx?.update?.callback_query?.message?.message_id;
      ctx.session.default_value = result?.default_value;
      ctx.session.default_role = result?.default_role;
      ctx.session.default_mode = true;
      ctx.session.weekShift = 0;

      if (!ctx.session.default_value || !ctx.session.default_role)
        ctx.scene.enter('defaultValueScene');

      ctx.scene.enter('scheduleScene');
    })
    .catch((err) => {
      ctx.reply(
        'Щось пішло не так, спробуй ще(/start) раз або звернися по допомогу до творця бота',
      );
      console.log(err);
    });
}

module.exports = { bot };
