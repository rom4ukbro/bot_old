const { Markup, Scenes } = require('telegraf');

const {
  progressWelcome,
  progressTextButton,
  debtsTextButton,
  noDebtsText,
  hasDebtsText,
  mainMenu,
  loadProgress,
  errorPassText,
  errorProgressText,
} = require('../text');

const { progressParse, toMessage } = require('../../Parser/progressParse.js');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [{ text: progressTextButton, callback_data: progressTextButton }],
  [{ text: debtsTextButton, callback_data: debtsTextButton }],
  [{ text: mainMenu, callback_data: mainMenu }],
]);

const backKeyboard = [[{ text: 'Назад', callback_data: mainMenu }]];

// ===================   Welcome scene   =========================

const progressScene = new Scenes.BaseScene('progressScene');

progressScene.enter((ctx) => {
  try {
    ctx.editMessageText(progressWelcome, {
      reply_markup: { inline_keyboard: backKeyboard },
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });

    for (i = ctx.session.id - 100; i < ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    console.log(e);
  }
});

progressScene.command('start', async (ctx) => {
  await ctx.scene.enter('welcomeScene');

  ctx.session.id = ctx.message.message_id;

  for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
    ctx.deleteMessage(i).catch((err) => {});
  }
  ctx.deleteMessage(ctx.session.oneMessegeId).catch((err) => {});
  ctx.session.progress = null;
});

progressScene.on('text', async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id);
  if (ctx.message.text.split(' ').length > 2) {
    return ctx.telegram.editMessageText(
      ctx.from.id,
      ctx.session.oneMessegeId,
      '',
      'Надто багато пробілів, спробуй ще раз',
    );
  }
  if (ctx.message.text.split(' ').length < 2) {
    return ctx.telegram.editMessageText(
      ctx.from.id,
      ctx.session.oneMessegeId,
      '',
      'Надто мало слів, спробуй ще раз',
    );
  }
  ctx.telegram.editMessageText(ctx.from.id, ctx.session.oneMessegeId, '', loadProgress);
  try {
    ctx.session.progress = await progressParse({
      login: ctx.message.text.split(' ')[0],
      password: ctx.message.text.split(' ')[1],
    });

    if (ctx.session.progress.errorPass) {
      ctx.telegram.editMessageText(ctx.from.id, ctx.session.oneMessegeId, '', errorPassText);
    }
    if (ctx.session.progress.error) {
      ctx.telegram.editMessageText(
        ctx.from.id,
        ctx.session.oneMessegeId,
        '',
        errorProgressText,
        backKeyboard,
      );
    }

    ctx.telegram.editMessageText(
      ctx.from.id,
      ctx.session.oneMessegeId,
      '',
      toMessage(ctx.session.progress.data, ctx.session.progress.sr),
      choiceKeyboard,
    );
    ctx.reply();
  } catch (e) {
    console.log(e);
  }
});

progressScene.action(progressTextButton, (ctx) => {
  try {
    ctx.editMessageText(
      toMessage(ctx.session.progress.data, ctx.session.progress.sr),
      choiceKeyboard,
    );
    ctx.answerCbQuery();
  } catch (e) {}
});

progressScene.action(debtsTextButton, async (ctx) => {
  try {
    if (!ctx.session.progress.debts.length) {
      ctx.answerCbQuery();
      return await ctx.editMessageText(noDebtsText, choiceKeyboard);
    }
    ctx.answerCbQuery('Ящик пандори відкрито!');
    ctx.editMessageText(
      hasDebtsText + '\n\n' + toMessage(ctx.session.progress.debts),
      choiceKeyboard,
    );
  } catch (e) {}
});

progressScene.action(mainMenu, async (ctx) => {
  try {
    await ctx.scene.enter('welcomeScene');
    ctx.answerCbQuery();
    ctx.session.progress = null;
  } catch (e) {}
});

module.exports = progressScene;
