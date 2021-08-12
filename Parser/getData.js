const cheerio = require("cheerio");
const linkify = require("linkifyjs");

function getData(html) {
  data = [];
  const $ = cheerio.load(html);
  let lesson, numLess;
  if ($("#wrap > div > div > div > div.alert.alert-info").length > 0)
    return { vx: "bx" };
  else {
    $("table").each(async (i, elem) => {
      let trArr = $(elem).find("tr");
      let h4 = $(".col-md-6 h4")[i].childNodes[0];
      let weekDay = h4.next.childNodes[0].data;
      var data1 = [];
      var z = 0;
      for (var ii = 0; ii < trArr.length; ii++) {
        try {
          numLess = trArr[ii].childNodes[0].childNodes[0].data;
          timeBounds = trArr[ii].childNodes[1].childNodes;
          lesson = trArr[ii].childNodes[2].childNodes[0];
          const buildName = buildNameLess(lesson).trim();
          if (buildName != "") {
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

function buildNameLess(lessTag, names = "") {
  if (lessTag.next === null) {
    if (names == undefined) return lessTag.data;
    return names;
  }
  if (lessTag.name) {
    if (lessTag.name === "br") return buildNameLess(lessTag.next, names);
    if (lessTag.name === "div") {
      if (lessTag.childNodes.length === 6) {
        let links = linkify.find(lessTag.childNodes[2].data),
          pattern = /[а-яёіїґА-ЯЁІЇҐa-zA-Z0-9\.].+[а-яёіїґА-ЯЁІЇҐa-zA-Z0-9\.]/;
        for (let i = 0; i < links.length; i++) {
          if (names.charAt(8) == "[")
            names = names.slice(0, 8) + names.slice(9, names.length) + "\n\n";
          if (names.charAt(0) == "[") names = names.slice(1) + "\n\n";
          const el = links[i];
          let str;
          if (i == 0) str = lessTag.childNodes[2].data.substring(0, el.start);
          else
            str = lessTag.childNodes[2].data.substring(
              links[i - 1].end,
              el.start,
            );
          str = pattern.exec(str);
          names += `\n[${str}](${el.href})`;
        }
        if (links.length != 0) {
          let str = lessTag.childNodes[2].data.substring(
            links[links.length - 1].end,
          );
          str = pattern.exec(str);
          names += `\n[${str}](${lessTag.childNodes[4]?.attribs?.href})`;
        }
        if (links.length == 0) {
          names += `${lessTag.childNodes[2].data}](${lessTag.childNodes[4]?.attribs?.href})`;
        }
      } else if (lessTag.childNodes[2]?.attribs?.href.length > 2) {
        names = names.trim();
        names += `](${lessTag.childNodes[2].attribs.href})\n\n`;
      } else {
        if (names.charAt(8) == "[")
          names = names.slice(0, 8) + names.slice(9, names.length) + "\n\n";
        if (names.charAt(0) == "[") names = names.slice(1) + "\n\n";
      }

      return buildNameLess(lessTag.next, names);
    }
  }
  if (lessTag.type === "text") {
    if (lessTag.data.trim() === "онлайн") {
      names = names.slice(0, -1);
      names += "`онлайн`[";
      return buildNameLess(lessTag.next, names);
    }
    if (names === "") {
      names = `[${lessTag.data}`;
      return buildNameLess(lessTag.next, names);
    }
    names += ` ${lessTag.data.trim()}`;
    return buildNameLess(lessTag.next, names);
  }
}

module.exports = getData;
