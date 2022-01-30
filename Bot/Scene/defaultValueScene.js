const { Markup, Scenes } = require('telegraf');

const {
  studentWelcome,
  teacherWelcome,
  findQuery,
  toManyQueryFind,
  cantFindQuery,
} = require('../text');
const { getArrTeacher, getArrGroup } = require('../../Parser/getGroupAndTeacher.js');

const { findGroup, findTeacher } = require('../../Parser/search.js');

const {
  chooseWelcomeText,
  choiceStudentText,
  choiceTeacherText,
  defaultValueText,
} = require('../text');

const { Users } = require('../../DB/connect.js');

// ===================   keyboard   =========================

const choiceKeyboard = Markup.inlineKeyboard([
  [
    { text: choiceStudentText, callback_data: choiceStudentText },
    { text: choiceTeacherText, callback_data: choiceTeacherText },
  ],
  [{ text: 'Назад', callback_data: 'back' }],
]);

// ===================   defaultValue scene   =========================

const defaultValueScene = new Scenes.BaseScene('defaultValueScene');

const chooseScene = new Scenes.BaseScene('chooseScene');

defaultValueScene.enter((ctx) => {
  try {
    if (ctx?.update?.callback_query?.message?.message_id)
      ctx.editMessageText(defaultValueText, choiceKeyboard);
    else ctx.reply(defaultValueText, choiceKeyboard);

    ctx.session.id = ctx?.update?.callback_query?.message?.message_id || ctx.message.message_id;
    for (i = ctx.session.id - 100; i < ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    console.log(e);
  }
});

defaultValueScene.action(choiceStudentText, async (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.session.weekShift = 0;
    ctx.session.searchArr = await getArrGroup();
    ctx.session.mode = 'group';

    ctx.editMessageText(studentWelcome);
  } catch (e) {
    console.log(e);
  }
});

defaultValueScene.action(choiceTeacherText, async (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    ctx.session.weekShift = 0;
    ctx.session.searchArr = await getArrTeacher();
    ctx.session.mode = 'teacher';

    ctx.editMessageText(teacherWelcome);
  } catch (e) {
    console.log(e);
  }
});

defaultValueScene.action('back', async (ctx) => {
  try {
    await ctx.scene.enter('welcomeScene');
    ctx.answerCbQuery();
  } catch (e) {}
});

defaultValueScene.command('start', async (ctx) => {
  try {
    ctx.session.weekShift = 0;

    await ctx.scene.enter('chooseScene');

    ctx.session.id = ctx.message.message_id;
    for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    console.log(e);
  }
});

defaultValueScene.on('text', (ctx) => {
  if (!ctx.session.mode) {
    ctx.deleteMessage(ctx.message.message_id);
  } else if (ctx.session.mode == 'group') {
    searchFnc('group', ctx);
  } else if (ctx.session.mode == 'teacher') {
    searchFnc('teacher', ctx);
  }
});

// ===================   Helper`s function   =========================

function searchFnc(mode, ctx) {
  try {
    ctx.session.id = ctx.message.message_id;
    for (i = ctx.session.id - 100; i < ctx.session.id; i++) {
      if (i != ctx.session.oneMessegeId) ctx.deleteMessage(i).catch((err) => {});
    }
    if (ctx.session.searchArr[0] === 'error') {
      ctx.deleteMessage(ctx.message.message_id);
      return ctx.telegram.editMessageText(
        ctx.from.id,
        ctx.session.oneMessegeId,
        '',
        'Сталася помилка з сайтом, спробуй пізніше.\nНатисни /start',
      );
    }

    if (mode === 'group') {
      ctx.session.resultArr = findGroup(ctx.session.searchArr, ctx.message.text);
    }
    if (mode === 'teacher') {
      ctx.session.resultArr = findTeacher(ctx.session.searchArr, ctx.message.text);
    }
    if (ctx.session.resultArr.length === 0) {
      ctx.session.id = ctx.message.message_id;
      for (i = ctx.session.id; i >= ctx.session.id - 100; i--) {
        if (i != ctx.session.oneMessegeId) ctx.deleteMessage(i).catch((err) => {});
      }
      return ctx.telegram
        .editMessageText(ctx.from.id, ctx.session.oneMessegeId, '', cantFindQuery)
        .catch((err) => {});
    }
    if (ctx.session.resultArr.length === 1) {
      ctx.session.value = ctx.session.resultArr[0];

      Users.findOneAndUpdate(
        { _id: ctx.from.id },
        {
          default_value: ctx.session.resultArr[0],
          default_role: mode,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
        (error, result) => {
          if (error) return console.log(error);
        },
      );

      ctx.session.default_mode = true;
      ctx.session.default_value = ctx.session.resultArr[0];
      ctx.session.default_role = mode;

      ctx.session.id = ctx.message.message_id;
      for (i = ctx.session.id; i >= ctx.session.id - 100; i--) {
        if (i != ctx.session.oneMessegeId) ctx.deleteMessage(i).catch((err) => {});
      }
      return ctx.scene.enter('scheduleScene');
    }
    if (ctx.session.resultArr.length <= 100 && ctx.session.resultArr.length !== 1) {
      return ctx.reply(
        findQuery,
        Markup.keyboard(ctx.session.resultArr, { columns: 2 }).oneTime(true),
      );
    }
    if (ctx.session.resultArr.length > 100) {
      ctx.session.resultArr = ctx.session.resultArr.slice(0, 100);
      return ctx.reply(
        toManyQueryFind,
        Markup.keyboard(ctx.session.resultArr, { columns: 2 }).oneTime(true),
      );
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = { defaultValueScene };
