const { Markup, Scenes } = require('telegraf');

const { absenceLess, explanatoryNote, individualTraining } = require('./statementText');

// ===================   keyboard   =========================

const contactKeyboard = Markup.inlineKeyboard(
  [
    { text: absenceLess, callback_data: absenceLess },
    { text: explanatoryNote, callback_data: explanatoryNote },
    { text: individualTraining, callback_data: individualTraining },
    { text: 'Назад', callback_data: 'back' },
  ],
  {
    columns: 2,
  },
);

// ===================   Welcome scene   =========================

const statementScene = new Scenes.BaseScene('statementScene');

statementScene.enter((ctx) => {
  try {
    ctx.editMessageText('Яка довідка тобі потрібна?', contactKeyboard);
  } catch (e) {
    console.log(e);
  }
});

statementScene.action(absenceLess, (ctx) => {
  ctx.answerCbQuery();
  return ctx.scene.enter('statement1Scene');
});

statementScene.action(explanatoryNote, (ctx) => {
  ctx.answerCbQuery();
  return ctx.scene.enter('statement2Scene');
});

statementScene.action(individualTraining, (ctx) => {
  ctx.answerCbQuery();
  return ctx.scene.enter('statement3Scene');
});

statementScene.action('back', (ctx) => {
  ctx.answerCbQuery();
  return ctx.scene.enter('welcomeScene');
});

module.exports = { statementScene };
