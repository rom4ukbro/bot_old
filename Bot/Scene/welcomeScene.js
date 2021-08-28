const {
  Telegraf,
  Markup,
  Scenes: { BaseScene, Stage },
  Scenes,
} = require('telegraf');

const {
  welcomeText,
  aboutText,
  choiceStudentText,
  choiceTeacherText,
  changeQueryText,
  helpText,
} = require('../text');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [{ text: choiceStudentText, callback_data: choiceStudentText }],
  [{ text: choiceTeacherText, callback_data: choiceTeacherText }],
]);

// ===================   Welcome scene   =========================

const welcomeScene = new Scenes.BaseScene('welcomeScene');

welcomeScene.enter((ctx) => {
  try {
    ctx.reply(welcomeText, choiceKeyboard);

    ctx.session.id =
      ctx?.update?.callback_query?.message?.message_id ||
      ctx.message.message_id;
    for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    console.log(e);
  }
});
welcomeScene.action(choiceStudentText, (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('studentScene');
  } catch (e) {
    console.log(e);
  }
});
welcomeScene.action(choiceTeacherText, (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.scene.enter('teacherScene');
  } catch (e) {
    console.log(e);
  }
});

module.exports = welcomeScene;
