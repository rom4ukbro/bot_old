const fetch = require('node-fetch');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const scheduleURL =
  process.env.SCHEDULE_URL || 'https://education.ugi.edu.ua/cgi-bin/timetable.cgi?';
const teacherUrl = `${scheduleURL}n=701&lev=141`;
const groupUrl = `${scheduleURL}n=701&lev=142`;

let groupArr, teacherArr;

async function getArrTeacher() {
  teacherArr = await getArr(teacherUrl);
  return teacherArr;
}
async function getArrGroup() {
  groupArr = await getArr(groupUrl);
  return groupArr;
}

async function getArr(url) {
  arr = [];
  await fetch(url)
    .then((res) => res.textConverted())
    .then((response) => (arr = JSON.parse(response)['suggestions']))
    .catch((err) => {
      arr = ['error'];
    });
  return arr;
}
module.exports = { getArrTeacher, getArrGroup };
