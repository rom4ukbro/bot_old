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

// ===================   Student scene   =========================

const studentScene = new Scenes.BaseScene('studentScene');

studentScene.enter(async (ctx) => {
  try {
    ctx.session.weekShift = 0;
    ctx.session.time = 0;

    ctx.editMessageText(studentWelcome);
    ctx.session.searchArr = await getArrGroup();
  } catch (e) {
    console.log(e);
  }
  // Marchik Hotyn
});

studentScene.command('start', async (ctx) => {
  try {
    ctx.session.time = 0;
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

studentScene.on('text', (ctx) => {
  searchFnc('group', ctx);
});

// ===================   Teacher scene   =========================

const teacherScene = new Scenes.BaseScene('teacherScene');

teacherScene.enter(async (ctx) => {
  try {
    ctx.session.time = 0;
    ctx.session.weekShift = 0;
    ctx.session.searchArr = await getArrTeacher();
    ctx.editMessageText(teacherWelcome);
  } catch (e) {
    console.log(e);
  }
});

teacherScene.command('start', async (ctx) => {
  try {
    ctx.session.time = 0;
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

teacherScene.on('text', (ctx) => {
  searchFnc('teacher', ctx);
});

// ===================   Helper`s function   =========================

function searchFnc(mode, ctx) {
  try {
    ctx.session.mode = mode;
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

module.exports = { studentScene, teacherScene };
