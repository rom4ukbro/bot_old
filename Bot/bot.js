const {
  Telegraf,
  Markup,
  Scenes: { Stage },
  session,
  Context,
} = require('telegraf');

const moment = require('moment');
moment.locale('uk');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { Users } = require('../DB/connect.js');

const {
  welcomeScene,
  progressScene,
  chooseScene,
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
  mailingUpdateScene,
  defaultValueScene,
  cbScene,
  studentScene,
  teacherScene,
  scheduleScene,
  writeDateScene
} = require('./Scene');
const {
  statementScene,
  statement1Scene,
  statement2Scene,
  statement3Scene,
  statement4Scene,
  statement5Scene,
  statement6Scene,
  statement7Scene,
  statement8Scene,
  statement9Scene,
  statement10Scene,
} = require('./Scene/statementScene');
const { command, actionsDef, actionsAdd } = require('./composers')

// const http = require('../server');

//
//

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const stage = new Stage([
  progressScene,
  welcomeScene,
  chooseScene,
  studentScene,
  teacherScene,
  scheduleScene,
  writeDateScene,
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
  cbScene,
  defaultValueScene,
  mailingUpdateScene,
  statementScene,
  statement1Scene,
  statement2Scene,
  statement3Scene,
  statement4Scene,
  statement5Scene,
  statement6Scene,
  statement7Scene,
  statement8Scene,
  statement9Scene,
  statement10Scene,
]);

const bot = new Telegraf(token);

bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
  Users.updateOne({ _id: ctx.from.id }, { last_activity: new Date() })
  next()
})
bot.use(command)
bot.use(actionsDef)
bot.use(actionsAdd)

bot.on('message', async (ctx) => {
  try {
    ctx.deleteMessage(ctx.message.message_id).catch((e) => { });
  } catch (error) { }
});

bot.on('callback_query', (ctx) => {
  try {
    ctx.session.oneMessageId = ctx?.update?.callback_query?.message?.message_id
    ctx.scene.enter('welcomeScene');
  } catch (e) {
    ctx.answerCbQuery('Ой, щось пішло не так');
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

module.exports = { bot };
