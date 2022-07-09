const { Markup } = require('telegraf');
const {
  weekDaysBtn,
  choiceStudentText,
  choiceTeacherText,
  nextWeekText,
  todayText,
  previousWeekText,
  manualDateBtnEntry,
  changeQueryBtnText,
  allWeekBtnText,
  mainMenu,
} = require('../text');

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

module.exports = { scheduleKeyboard, choiceKeyboard }
