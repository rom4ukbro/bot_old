const cheerio = require('cheerio');
const linkify = require('linkifyjs');

function getData(html) {
  data = [];
  const $ = cheerio.load(html);
  let lesson, numLess;
  if ($('#wrap > div > div > div > div.alert.alert-info').length > 0) return { vx: 'bx' };
  else {
    $('table').each(async (i, elem) => {
      let trArr = $(elem).find('tr');
      let h4 = $('.col-md-6 h4')[i].childNodes[0];
      let weekDay = h4.next.childNodes[0].data;
      var data1 = [];
      var z = 0;
      for (var ii = 0; ii < trArr.length; ii++) {
        try {
          numLess = trArr[ii].childNodes[0].childNodes[0].data;
          timeBounds = trArr[ii].childNodes[1].childNodes;
          lesson = trArr[ii].childNodes[2].childNodes[0];
          const buildName = buildNameLess(lesson).trim();
          if (buildName != '') {
            data1.push({
              number: numLess,
              timeBounds: `${timeBounds[0].data}-${timeBounds[2].data}`,
              info: buildName,
            });
          }
          if (z == 0)
            data[weekDay] = {
              date: h4.data.trim(),
              day: weekDay,
              items: data1,
            };
          z++;
        } catch (err) {
          console.log(err);
        }
      }
    });
    return { ...data };
  }
}

function buildNameLess(lessTag, names = '') {
  if (lessTag.next === null) {
    if (names == undefined) return lessTag.data;
    return names;
  }
  if (lessTag.name) {
    if (lessTag.name === 'br') return buildNameLess(lessTag.next, names);
    if (lessTag.name === 'div') {
      if (lessTag.childNodes.length === 6) {
        const str = lessTag.childNodes[2].data;
        const reg = new RegExp(';', 'ig');
        let arrOfStr,
          st = 0,
          costyl = [];
        while ((arrOfStr = reg.exec(str)) != null) {
          less = str.slice(st, arrOfStr.index);
          if (linkify.find(less)[0]) {
            link = linkify.find(less);
            less = less.slice(0, link[0].start - 3);
            names += `\n[${less.trim()}](${link[0].href})`;
          } else {
            names += '\n' + less.trim();
          }
          costyl.push(st);
          st = arrOfStr.index + 1;
        }
        if (str.slice(st)) names += '\n' + str.slice(st);
        if (lessTag.childNodes[4]?.attribs?.href.length) {
          if (str.slice(st)) {
            names = names.replace(
              str.slice(st),
              `[${str.slice(st, str.length - 2)}](${lessTag.childNodes[4]?.attribs?.href})`,
            );
          } else {
            names = names.replace(
              str.slice(costyl[costyl.length - 1], str.length - 3).trim(),
              `[${str.slice(costyl[costyl.length - 1], str.length - 5).trim()}](${
                lessTag.childNodes[4]?.attribs?.href
              })`,
            );
          }
        }
      } else if (lessTag.childNodes[2]?.attribs?.href.length > 2) {
        names = names.trim();
        onl = names.split(' ');
        if (onl[0] == 'онлайн') {
          names = `${onl.shift()} [${onl.join(' ')}](${lessTag.childNodes[2].attribs.href})\n\n`;
        } else names = '[' + names + `](${lessTag.childNodes[2].attribs.href})\n\n`;
      } else {
        names += '\n\n';
      }

      return buildNameLess(lessTag.next, names);
    }
  }
  if (lessTag.type === 'text') {
    names ? (names += ` ${lessTag.data.trim()}`) : (names = `${lessTag.data}`);
    return buildNameLess(lessTag.next, names);
  }
}

module.exports = getData;
