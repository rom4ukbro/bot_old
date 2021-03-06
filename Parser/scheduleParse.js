const puppeteer = require('puppeteer');
// const Nightmare = require('nightmare');
getData = require('./getData.js');
const moment = require('moment');
moment.locale('uk');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { noLessonsText, noLessonsWeekText } = require('../Bot/text.js');

const scheduleURL =
  process.env.SCHEDULE_URL || 'https://education.ugi.edu.ua/cgi-bin/timetable.cgi?';

async function parse(obj) {
  var start = new Date(); // засекли время
  obj.weekShift *= 7;

  const day = moment().add(obj.weekShift, 'days').format('dddd');
  let sDate, eDate;

  switch (day) {
    case 'понеділок': {
      sDate = moment().add(obj.weekShift, 'days').format('L');
      eDate = moment()
        .add(obj.weekShift + 6, 'days')
        .format('L');
      break;
    }
    case 'вівторок': {
      sDate = moment()
        .add(obj.weekShift - 1, 'days')
        .format('L');
      eDate = moment()
        .add(obj.weekShift + 5, 'days')
        .format('L');
      break;
    }
    case 'середа': {
      sDate = moment()
        .add(obj.weekShift - 2, 'days')
        .format('L');
      eDate = moment()
        .add(obj.weekShift + 4, 'days')
        .format('L');
      break;
    }
    case 'четвер': {
      sDate = moment()
        .add(obj.weekShift - 3, 'days')
        .format('L');
      eDate = moment()
        .add(obj.weekShift + 3, 'days')
        .format('L');
      break;
    }
    case 'п’ятниця': {
      sDate = moment()
        .add(obj.weekShift - 4, 'days')
        .format('L');
      eDate = moment()
        .add(obj.weekShift + 2, 'days')
        .format('L');
      break;
    }
    case 'субота': {
      sDate = moment()
        .add(obj.weekShift - 5, 'days')
        .format('L');
      eDate = moment()
        .add(obj.weekShift + 1, 'days')
        .format('L');
      break;
    }
    case 'неділя': {
      sDate = moment()
        .add(obj.weekShift - 6, 'days')
        .format('L');
      eDate = moment().add(obj.weekShift, 'days').format('L');
      break;
    }
  }
  let result = {};
  try {
    // const nightmare = Nightmare({ show: false });

    // await nightmare
    //   .goto(scheduleURL)
    //   .click(`#${obj.mode}`)
    //   .type(`#${obj.mode}`, obj.value)
    //   .type('input[name="sdate"]', sDate)
    //   .type('input[name="edate"]', eDate)
    //   .click(
    //     '#wrap > div > div > div > div.page-header > form > div:nth-child(3) > div.col-md-6.col-xs-12 > button',
    //   )
    //   .wait('h4.visible-xs.text-center')
    //   .evaluate(() => document.querySelector('body').innerHTML)
    //   .end()
    //   .then((response) => {
    //     result = getData(response);
    //     result.sDate = sDate;
    //     result.eDate = eDate;
    //     console.log(result);
    //   })
    //   .catch((error) => {
    //     console.error('Search failed:', error);
    //     result.error = true;
    //   });

    var browser = await puppeteer.launch({
      // headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--single-process'],
    });
    const page = await browser.newPage();
    await page.goto(scheduleURL);
    await page.waitForSelector(`#${obj.mode}`);
    await page.type('input[name="sdate"]', sDate);
    await page.type('input[name="edate"]', eDate);
    await page.type(`#${obj.mode}`, obj.value);
    await page.keyboard.press(`Enter`);
    await page.waitForSelector('h4.visible-xs.text-center');
    await page
      .evaluate(() => document.querySelector('body').innerHTML)
      .then((response) => {
        result = getData(response);
        result.sDate = sDate;
        result.eDate = eDate;
      });
  } catch (err) {
    console.log(err);
    result.error = true;
  } finally {
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));
    await browser.close();
  }

  var end = new Date(); // конец измерения

  // console.log("Цикл занял " + (end - start) / 1000 + " s");

  return result;
}

function toMessage(obj, day, value, space) {
  obj1 = obj[day];
  var message;
  if (obj1 === undefined) {
    let date;
    switch (day) {
      case 'Понеділок': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(0, 'days').format('L');
        break;
      }
      case 'Вівторок': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(1, 'days').format('L');
        break;
      }
      case 'Середа': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(2, 'days').format('L');
        break;
      }
      case 'Четвер': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(3, 'days').format('L');
        break;
      }
      case "П'ятниця": {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(4, 'days').format('L');
        break;
      }
      case 'Субота': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(5, 'days').format('L');
        break;
      }
      case 'Неділя': {
        date = moment(obj.sDate, 'DD.MM.YYYY').add(6, 'days').format('L');
        break;
      }
    }
    return (message = `*${value}\n${day} ${date}*\n\n${noLessonsText}`);
  }
  message = `*${value}\n${obj1.day} ${obj1.date}*\n\n`;
  for (let i = 0; i < obj1.items.length; i++) {
    const el = obj1.items[i];
    el.info = el.info.replace(/`/g, "'");
    el.info = el.info.replace(/\n\  /g, '\n');
    space != undefined
      ? (message += `_${el.number}) ${el.timeBounds}_\n${el.info}\n${space}\n`)
      : (message += `_${el.number}) ${el.timeBounds}_\n${el.info}\n\n`);
  }

  space == ' ' ? (message += space) : 0;

  return message;
}

function toWeekMessage(obj, day, value) {
  var message;
  if (obj.vx) {
    return (message = `*${value}\nТиждень ${obj.sDate} - ${obj.eDate}*\n\n${noLessonsWeekText}`);
  }
  message = `*${value}\nТиждень ${obj.sDate} - ${obj.eDate}*\n\n`;
  for (let key in obj) {
    if (key != 'vx' && key != 'sDate' && key != 'eDate') {
      const el = obj[key];
      message += `*${el.day} ${el.date}*\n`;
      for (let i = 0; i < el.items.length; i++) {
        const el2 = el.items[i];
        el2.info = el2.info.replace(/`/g, "'");
        el2.info = el2.info.replace(/\n\  /g, '\n');
        message += `_${el2.number}) ${el2.timeBounds}_\n${el2.info}\n\n`;
      }
      message += '\n';
    }
  }
  return message;
}

module.exports = { parse, toMessage, toWeekMessage };
