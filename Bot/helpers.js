const {
  fullDays,
  weekDaysBtn,
  allWeekBtnText,
  floodText,
} = require('./text');
const { scheduleKeyboard } = require('./keyboards')
const { redisGetData } = require('../DB/redis.js');
const { toMessage } = require('../Parser/scheduleParse.js');

const emoji = require('node-emoji');
const checkBtn = emoji.get(':pushpin:');


function deleteMessage(ctx, messageId, oneMessageId = undefined) {
  for (let i = messageId - 100; i <= messageId; i++) {
    if (i == oneMessageId) continue
    ctx.deleteMessage(i).catch((err) => { });
  }
}

async function daySchedule(day, ctx) {
  try {
    setTimeout(() => {
      ctx.session.time = 0;
    }, 500);
    if (ctx.session.time !== 0) return ctx.answerCbQuery(floodText, { show_alert: true });
    ctx.session.time = 1;

    ctx.session.scheduleKeyboard = JSON.parse(JSON.stringify(scheduleKeyboard));
    ctx.session.weekDaysBtn = [...weekDaysBtn];
    ctx.session.day = day;
    ctx.session.weekDaysBtn[ctx.session.weekDaysBtn.findIndex((el) => el.text == ctx.session.day)] = {
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

module.exports = { deleteMessage, daySchedule, switchDay }