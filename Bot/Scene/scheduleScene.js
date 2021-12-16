const {
  Telegraf,
  Markup,
  Scenes: { BaseScene, Stage },
  Scenes,
} = require('telegraf');
const emoji = require('node-emoji');
const moment = require('moment');
moment.locale('uk');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const {
  errorLoadText,
  loadSchedule,
  fullDays,
  weekDaysBtn,
  aboutText,
  choiceStudentText,
  choiceTeacherText,
  changeQueryText,
  nextWeekText,
  todayText,
  previousWeekText,
  manualDateBtnEntry,
  changeQueryBtnText,
  allWeekBtnText,
  aboutBtnText,
  enterDateText,
  errorDateText,
  floodText,
  mainMenu,
} = require('../text');
const { parse, toMessage, toWeekMessage } = require('../../Parser/scheduleParse.js');
const { redisWriteData, redisGetData, redisDelData } = require('../../DB/redis.js');

const ttl = process.env.TIME_TO_LIVE || 3600 * 2;

// ===================   Schedule keyboard   =========================

const scheduleKeyboard = [
  weekDaysBtn,
  [
    { text: previousWeekText, callback_data: previousWeekText },
    { text: todayText, callback_data: todayText },
    { text: nextWeekText, callback_data: nextWeekText },
  ],
  [
    { text: manualDateBtnEntry, callback_data: manualDateBtnEntry },
    {
      text: allWeekBtnText,
      callback_data: allWeekBtnText,
    },
  ],
  [
    { text: mainMenu, callback_data: mainMenu },
    { text: changeQueryBtnText, callback_data: changeQueryBtnText },
  ],
];

const choiceKeyboard = Markup.inlineKeyboard([
  [
    { text: choiceStudentText, callback_data: choiceStudentText },
    { text: choiceTeacherText, callback_data: choiceTeacherText },
  ],
  [{ text: 'Назад', callback_data: 'back' }],
]);

// ===================   Schedule scene   =========================

const scheduleScene = new Scenes.BaseScene('scheduleScene');

const checkBtn = emoji.get(':pushpin:');

scheduleScene.enter(async (ctx) => {
  try {
    if (!(await redisGetData(ctx.session.value + '_' + ctx.session.weekShift))) {
      ctx.telegram
        .editMessageText(ctx.from.id, ctx.session.oneMessegeId, '', loadSchedule)
        .catch((err) => {});
      await redisWriteData(
        ctx.session.value + '_' + ctx.session.weekShift,
        await parse({
          mode: ctx.session.mode,
          value: ctx.session.value,
          weekShift: ctx.session.weekShift,
        }),
        ttl,
      );
    }
    if ((await redisGetData(ctx.session.value + '_' + ctx.session.weekShift)).error == true) {
      await redisDelData(ctx.session.value + '_' + ctx.session.weekShift);
      return ctx.telegram.editMessageText(
        ctx.from.id,
        ctx.session.oneMessegeId,
        '',
        errorLoadText,
        Markup.inlineKeyboard([[{ text: 'Спробувати ще раз', callback_data: 'again' }]]),
      );
    }
    if (!ctx.session.day) {
      if (moment().format('LT') > '18:00') {
        ctx.session.day =
          moment().add(1, 'day').format('dd').charAt(0).toUpperCase() +
          moment().add(1, 'day').format('dd').charAt(1);
      } else
        ctx.session.day =
          moment().format('dd').charAt(0).toUpperCase() + moment().format('dd').charAt(1);
    }

    ctx.session.scheduleKeyboard = scheduleKeyboard;

    ctx.session.weekDaysBtn = [...weekDaysBtn];
    ctx.session.weekDaysBtn[indexOfArr(ctx.session.weekDaysBtn, ctx.session.day)] = {
      text: checkBtn,
      callback_data: checkBtn,
    };
    ctx.session.scheduleKeyboard[0] = ctx.session.weekDaysBtn;
    ctx.session.fulDay = fullDays[ctx.session.day];
    ctx.session.scheduleKeyboard[2][1] = {
      text: allWeekBtnText,
      callback_data: allWeekBtnText,
    };
    ctx.telegram
      .editMessageText(
        ctx.from.id,
        ctx.session.oneMessegeId,
        '',
        toMessage(
          await redisGetData(ctx.session.value + '_' + ctx.session.weekShift),
          ctx.session.fulDay,
          ctx.session.value,
        ),
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: { inline_keyboard: ctx.session.scheduleKeyboard },
        },
      )
      .catch((err) => {
        console.log(err);
      });
  } catch (e) {
    console.log(e);
  }
});
scheduleScene.action('again', (ctx) => {
  ctx.scene.enter('scheduleScene');
});

scheduleScene.action(checkBtn, (ctx) => ctx.answerCbQuery());
scheduleScene.action('Пн', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Вт', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Ср', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Чт', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Пт', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Сб', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});
scheduleScene.action('Нд', (ctx) => {
  daySchedule(ctx.callbackQuery.data, ctx);
});

scheduleScene.action(previousWeekText, async (ctx) => {
  try {
    ctx.session.weekShift -= 1;
    await ctx.scene.enter('scheduleScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});
scheduleScene.action(nextWeekText, async (ctx) => {
  try {
    ctx.session.weekShift += 1;
    await ctx.scene.enter('scheduleScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});
scheduleScene.action(todayText, async (ctx) => {
  try {
    ctx.session.day =
      moment().format('dd').charAt(0).toUpperCase() + moment().format('dd').charAt(1);
    ctx.session.weekShift = 0;
    await ctx.scene.enter('scheduleScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

scheduleScene.action(mainMenu, async (ctx) => {
  try {
    await ctx.scene.enter('welcomeScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

scheduleScene.action(changeQueryBtnText, async (ctx) => {
  try {
    await ctx.editMessageText(changeQueryText, choiceKeyboard);
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});
scheduleScene.action(choiceStudentText, async (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    await ctx.scene.enter('studentScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});
scheduleScene.action(choiceTeacherText, async (ctx) => {
  try {
    ctx.session.oneMessegeId = ctx.update.callback_query.message.message_id;
    await ctx.scene.enter('teacherScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

scheduleScene.action(manualDateBtnEntry, (ctx) => {
  try {
    ctx.scene.enter('writeDateScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

scheduleScene.action(aboutBtnText, async (ctx) => {
  try {
    await ctx.editMessageText(
      aboutText,
      Markup.inlineKeyboard([[{ text: 'Назад', callback_data: 'back' }]]),
    );
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

scheduleScene.action(allWeekBtnText, async (ctx) => {
  try {
    ctx.session.scheduleKeyboard = scheduleKeyboard;
    ctx.session.weekDaysBtn = [...weekDaysBtn];
    ctx.session.scheduleKeyboard[0] = ctx.session.weekDaysBtn;
    ctx.session.scheduleKeyboard[2][1] = {
      text: allWeekBtnText + emoji.get(':pushpin:'),
      callback_data: allWeekBtnText + emoji.get(':pushpin:'),
    };
    await ctx.editMessageText(
      toWeekMessage(
        await redisGetData(ctx.session.value + '_' + ctx.session.weekShift),
        ctx.session.fulDay,
        ctx.session.value,
      ),
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: ctx.session.scheduleKeyboard },
      },
    );

    ctx.answerCbQuery();
  } catch (e) {}
});

scheduleScene.action('back', async (ctx) => {
  try {
    await ctx.scene.enter('scheduleScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});
// ===================   Write date Scene   =========================

const writeDateScene = new Scenes.BaseScene('writeDateScene');

writeDateScene.enter((ctx) => {
  try {
    ctx.editMessageText(enterDateText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: 'Назад', callback_data: 'back' }]],
      },
    });
  } catch (e) {
    console.log(e);
  }
});

writeDateScene.command('start', async (ctx) => {
  try {
    ctx.session.time = 0;
    ctx.session.weekShift = 0;

    await ctx.scene.enter('chooseScene');

    ctx.session.id = ctx.message.message_id;
    for (i = ctx.session.id - 100; i <= ctx.session.id; i++) {
      ctx.deleteMessage(i).catch((err) => {});
    }
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

writeDateScene.on('text', (ctx) => {
  try {
    const pattern =
      /^(?:(?:31(\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
    if (!pattern.test(ctx.message.text)) {
      ctx.deleteMessage(ctx.message.message_id);
      return ctx.telegram
        .editMessageText(ctx.from.id, ctx.session.oneMessegeId, '', errorDateText, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: 'Назад', callback_data: 'back' }]],
          },
        })
        .catch((err) => {});
    }
    ctx.deleteMessage(ctx.message.message_id);

    ctx.session.weekShift = Math.round(
      (switchDay(
        moment(ctx.message.text, 'DD.MM.YYYY').format('dddd'),
        moment(ctx.message.text, 'DD.MM.YYYY').format('L'),
      ) -
        switchDay(moment().format('dddd'), moment().format('L'))) /
        1000 /
        60 /
        60 /
        24 /
        7,
    );
    ctx.session.day =
      moment(ctx.message.text, 'DD.MM.YYYY').format('dd').charAt(0).toUpperCase() +
      moment(ctx.message.text, 'DD.MM.YYYY').format('dd').charAt(1);
    ctx.scene.enter('scheduleScene');
  } catch (e) {
    console.log(e);
  }
});

writeDateScene.action('back', (ctx) => {
  try {
    ctx.scene.enter('scheduleScene');
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
});

// ===================   Helper`s function   =========================

async function daySchedule(day, ctx) {
  try {
    setTimeout(() => {
      ctx.session.time = 0;
    }, 500);
    if (ctx.session.time !== 0) return ctx.answerCbQuery(floodText, { show_alert: true });

    ctx.session.scheduleKeyboard = scheduleKeyboard;
    ctx.session.weekDaysBtn = [...weekDaysBtn];
    ctx.session.day = day;
    ctx.session.weekDaysBtn[indexOfArr(ctx.session.weekDaysBtn, ctx.session.day)] = {
      text: checkBtn,
      callback_data: checkBtn,
    };
    ctx.session.scheduleKeyboard[0] = ctx.session.weekDaysBtn;
    ctx.session.scheduleKeyboard[2][1] = {
      text: allWeekBtnText,
      callback_data: allWeekBtnText,
    };
    ctx.session.fulDay = fullDays[ctx.session.day];

    if (!(await redisGetData(ctx.session.value + '_' + ctx.session.weekShift)))
      return ctx.scene.enter('scheduleScene');
    ctx.session.time = 1;
    await ctx.editMessageText(
      toMessage(
        await redisGetData(ctx.session.value + '_' + ctx.session.weekShift),
        ctx.session.fulDay,
        ctx.session.value,
      ),
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: ctx.session.scheduleKeyboard },
      },
    );
    ctx.answerCbQuery();
  } catch (e) {
    ctx.answerCbQuery('Ой, сталася помилка. Спробуй ще раз');
    console.log(e);
  }
}

function indexOfArr(arr, query) {
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i].text;
    if (el == query) return i;
  }
  return -1;
}

function switchDay(day, date) {
  let sDate;
  switch (day) {
    case 'понеділок': {
      sDate = moment(date, 'DD.MM.YYYY').add(0, 'days');
      break;
    }
    case 'вівторок': {
      sDate = moment(date, 'DD.MM.YYYY').add(-1, 'days');
      break;
    }
    case 'середа': {
      sDate = moment(date, 'DD.MM.YYYY').add(-2, 'days');
      break;
    }
    case 'четвер': {
      sDate = moment(date, 'DD.MM.YYYY').add(-3, 'days');
      break;
    }
    case 'п’ятниця': {
      sDate = moment(date, 'DD.MM.YYYY').add(-4, 'days');
      break;
    }
    case 'субота': {
      sDate = moment(date, 'DD.MM.YYYY').add(-5, 'days');
      break;
    }
    case 'неділя': {
      sDate = moment(date, 'DD.MM.YYYY').add(-6, 'days');
      break;
    }
  }
  return sDate;
}

module.exports = { scheduleScene, writeDateScene };
