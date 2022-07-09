const { Markup, Scenes } = require('telegraf');

const { Users } = require('../../DB/connect.js');

const {
  welcomeText,
  choiceScheduleText,
  choiceProgressText,
  choiceStatementText,
} = require('../text');
const { deleteMessage } = require('../helpers');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [{ text: choiceScheduleText, callback_data: choiceScheduleText }],
  // [{ text: choiceProgressText, callback_data: choiceProgressText }],
  // [{ text: choiceStatementText, callback_data: choiceStatementText }],
]);

// ===================   Welcome scene   =========================

const welcomeScene = new Scenes.BaseScene('welcomeScene');

welcomeScene.enter((ctx) => {
  try {
    if (ctx?.update?.callback_query?.message?.message_id)
      ctx.editMessageText(welcomeText, choiceKeyboard).catch((err) => {
        ctx.editMessageText(welcomeText + ':', choiceKeyboard);
      });
    else ctx.reply(welcomeText, choiceKeyboard);

    deleteMessage(ctx, ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id, ctx.session.oneMessageId)
  } catch (e) { }
});

welcomeScene.action(choiceStatementText, (ctx) => {
  try {
    ctx.session.oneMessageId = ctx.update.callback_query.message.message_id;

    ctx.scene.enter('statementScene');
    ctx.answerCbQuery();
  } catch (e) {
    console.log(e);
  }
});

welcomeScene.action(choiceScheduleText, async (ctx) => {
  try {
    ctx.answerCbQuery();

    ctx.session.oneMessageId = ctx.update.callback_query.message.message_id;

    if (!!ctx.session.value && !!ctx.session.mode) {
      ctx.scene.enter('scheduleScene');
    } else if (!ctx.session.default_value || !ctx.session.default_role) {
      await Users.findOne({ _id: ctx.from.id })
        .then(async (result) => {
          ctx.session.default_value = result?.default_value;
          ctx.session.default_role = result?.default_role;
          ctx.session.weekShift = 0;
        })
        .catch((err) => { });

      if (ctx.session.default_value && ctx.session.default_role) {
        ctx.session.default_mode = true;
        return ctx.scene.enter('scheduleScene');
      }

      return ctx.scene.enter('defaultValueScene');
    } else if (ctx.session.default_value && ctx.session.default_role) {
      ctx.session.default_mode = true;
      ctx.scene.enter('scheduleScene');
    } else {
      ctx.scene.enter('chooseScene');
    }
  } catch (e) {
    console.log(e);
  }
});

welcomeScene.action(choiceProgressText, (ctx) => {
  try {
    return ctx.answerCbQuery('Це поки що не доступно :< Я працюю над цим ');
    ctx.session.oneMessageId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('progressScene');
  } catch (e) {
    console.log(e);
  }
});

module.exports = welcomeScene;
