const fetch = require('node-fetch');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const scheduleURL =
  process.env.SCHEDULE_URL || 'https://education.ugi.edu.ua/cgi-bin/timetable.cgi?';

let groupArr, teacherArr;

async function getArrTeacher() {
  const teacherUrl = `${scheduleURL}n=701&lev=141`;
  teacherArr = await getArr(teacherUrl);
  return teacherArr;
}
async function getArrGroup() {
  const groupUrl = `${scheduleURL}n=701&lev=142`;
  groupArr = await getArr(groupUrl);
  return groupArr;
}

async function getArr(url) {
  arr = [];
  try {
    await fetch(url)
      .then((res) => res.textConverted())
      .then((response) => (arr = JSON.parse(response)['suggestions']))
      .catch((err) => {
        arr = ['error'];
      });
    return arr;
  } catch (e) {
    console.log(e);
  }
}
module.exports = { getArrTeacher, getArrGroup };
