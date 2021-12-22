const puppeteer = require('puppeteer');

const scheduleURL = 'https://education.ugi.edu.ua/cgi-bin/classman.cgi?n=2';

async function pup() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();
  await page.goto(scheduleURL);
}

pup();
