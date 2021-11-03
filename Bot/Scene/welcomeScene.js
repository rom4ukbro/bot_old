const { Markup, Scenes } = require('telegraf');

const { welcomeText, choiceScheduleText, choiceProgressText } = require('../text');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [{ text: choiceScheduleText, callback_data: choiceScheduleText }],
  [{ text: choiceProgressText, callback_data: choiceProgressText }],
]);

// ===================   Welcome scene   =========================

const welcomeScene = new Scenes.BaseScene('welcomeScene');

welcomeScene.enter((ctx) => {
  try {
    if (ctx?.update?.callback_query?.message?.message_id)
      ctx.editMessageText(welcomeText, choiceKeyboard);
    else ctx.reply(welcomeText, choiceKeyboard);

    ctx.session.id = ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id;
    for (i = ctx.session.id - 100; i < ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    console.log(e);
  }
});

welcomeScene.action(choiceScheduleText, (ctx) => {
  try {
    ctx.answerCbQuery();
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('chooseScene');
  } catch (e) {
    console.log(e);
  }
});

welcomeScene.action(choiceProgressText, (ctx) => {
  try {
    ctx.answerCbQuery();
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('progressScene');
  } catch (e) {
    console.log(e);
  }
});

module.exports = welcomeScene;
