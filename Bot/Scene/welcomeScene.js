const {
  Telegraf,
  Markup,
  Scenes: { BaseScene, Stage },
  Scenes,
} = require("telegraf");

const {
  welcomeText,
  aboutText,
  choiceStudentText,
  choiceTeacherText,
  changeQueryText,
  helpText,
} = require("../text");

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [{ text: choiceStudentText, callback_data: choiceStudentText }],
  [{ text: choiceTeacherText, callback_data: choiceTeacherText }],
]);

// ===================   Welcome scene   =========================

const welcomeScene = new Scenes.BaseScene("welcomeScene");

welcomeScene.enter((ctx) => {
  ctx.reply(welcomeText, choiceKeyboard);

  ctx.session.id =
    ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id;
  for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
    ctx.deleteMessage(i).catch((err) => {});
  }
});
welcomeScene.action(choiceStudentText, (ctx) => {
  ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
  ctx.scene.enter("studentScene");
});
welcomeScene.action(choiceTeacherText, (ctx) => {
  ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
  ctx.scene.enter("teacherScene");
});

module.exports = welcomeScene;
