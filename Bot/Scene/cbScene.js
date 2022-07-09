const { Scenes } = require('telegraf');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

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
    ctx.deleteMessage(ctx.message.message_id).catch((e) => {});
    ctx.deleteMessage(ctx.session.cbId).catch((e) => {});
    ctx.scene.enter('chooseScene');
    ctx.telegram.sendMessage(
      '-1001378618059',
      `Від [${ctx.chat.first_name}](tg://user?id=${ctx.chat.id})` + '\n\n' + ctx.message.text,
      { parse_mode: 'Markdown' },
    );
  } catch (e) {
    console.log(e);
  }
});

module.exports = { cbScene };
