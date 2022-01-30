function findTeacher(arr, query) {
  arr = arr.map((item) => {
    return item.toLowerCase();
  });
  query = query.toLowerCase();
  let count = 0;
  count = arr.filter((el) => {
    return el.indexOf(query) != -1;
  });

  count = count.map((item) => {
    return capitalize(item);
  });
  return count.sort();
}

function findGroup(arr, query) {
  if (query === "-") return arr;
  arr = arr.map(function (x) {
    return x.toUpperCase();
  });
  query = query.toUpperCase();
  let count = 0;
  count = arr.filter((el) => {
    return el.indexOf(query) != -1;
  });

  if (query.charAt(0) !== "З") {
    count2 = count.filter((el) => {
      return el.charAt(0) !== "З";
    });

    return count2.sort();
  }

  if (query.charAt(0) == "З") {
    count3 = count
      .map((el) => {
        if (el.charAt(0) == "З") return unCapitalize(el);
        else return el;
      })
      .filter((el) => el.charAt(0) === "з");

    return count3.sort();
  }
}

function capitalize(str) {
  return str.replace(/(^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}

function unCapitalize(str) {
  return str.replace(/(^|\s)\S/g, function (a) {
    return a.toLowerCase();
  });
}

module.exports = { findGroup, findTeacher };
