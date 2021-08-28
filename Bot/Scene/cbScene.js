const {
  Telegraf,
  Markup,
  Context,
  Scenes: { BaseScene, Stage },
  Scenes,
  session,
} = require('telegraf');

const dotenv = require('dotenv');
const welcomeScene = require('./welcomeScene');
dotenv.config({ path: './config.env' });

const cbScene = new Scenes.BaseScene('cbScene');

cbScene.enter((ctx) => {
  try {
    ctx.session.cbId = ctx?.update?.callback_query?.message?.message_id;
    ctx.editMessageText('Напиши те, що хочеш, але тільки одним повідомленням', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Відмінити', callback_data: 'del' }]],
      },
    });
  } catch (e) {
    console.log(e);
  }
});

cbScene.on('text', (ctx) => {
  try {
    ctx.deleteMessage(ctx.message.message_id);
    ctx.deleteMessage(ctx.session.cbId);
    ctx.scene.enter('welcomeScene');
    ctx.telegram.sendMessage(
      '-1001378618059',
      `Від [${ctx.chat.first_name}](tg://user?id=${ctx.chat.id})` +
        '\n\n' +
        ctx.message.text,
      { parse_mode: 'Markdown' },
    );
  } catch (e) {
    console.log(e);
  }
});

module.exports = { cbScene };
