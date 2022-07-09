const { Markup, Scenes } = require('telegraf');

const { chooseWelcomeText, choiceStudentText, choiceTeacherText } = require('../text');
const { deleteMessage } = require('../helpers');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [
    { text: choiceStudentText, callback_data: choiceStudentText },
    { text: choiceTeacherText, callback_data: choiceTeacherText },
  ],
  [{ text: 'Назад', callback_data: 'back' }],
]);

// ===================   Welcome scene   =========================

const chooseScene = new Scenes.BaseScene('chooseScene');

chooseScene.enter((ctx) => {
  try {
    if (ctx?.update?.callback_query?.message?.message_id)
      ctx.editMessageText(chooseWelcomeText, choiceKeyboard);
    else ctx.reply(chooseWelcomeText, choiceKeyboard);

    deleteMessage(ctx, ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id)
  } catch (e) {
    console.log(e);
  }
});
chooseScene.action(choiceStudentText, (ctx) => {
  try {
    ctx.session.oneMessageId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('studentScene');
  } catch (e) {
    console.log(e);
  }
});
chooseScene.action(choiceTeacherText, (ctx) => {
  try {
    ctx.session.oneMessageId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('teacherScene');
  } catch (e) {
    console.log(e);
  }
});

chooseScene.action('back', async (ctx) => {
  try {
    await ctx.scene.enter('welcomeScene');
    ctx.answerCbQuery();
  } catch (e) { }
});

module.exports = chooseScene;
