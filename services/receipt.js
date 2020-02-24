/* * */
/* * */
/* * * * * */
/* PRINT API */
/* * */

/* * */
/* IMPORTS */
const config = require("config");

exports.items = items => {
  let finalString = "";
  for (const i of items) {
    const line1 = this.columns([i.title, i.amounts.net_total]);
    const line2 =
      "  " + i.qty + " x " + i.amounts.net_unit + " (" + i.tax.rate + "%)";
    finalString += line1 + "\n" + line2 + "\n";
  }
  return finalString.slice(0, finalString.length - 1);
};

exports.taxes = taxes => {
  let finalString = "";
  for (const t of taxes) {
    finalString += this.columns([t.rate + "%", t.base, t.amount]) + "\n";
  }
  return finalString.slice(0, finalString.length - 1);
};

exports.line = () => {
  let line = "";
  for (let pw = 0; pw < config.get("settings.paper-width"); pw++) line += "-";
  return line;
};

exports.dashedLine = () => {
  let dashedLine = "";
  for (let pw = 0; pw < config.get("settings.paper-width"); pw++) {
    dashedLine += pw % 2 ? " " : "-";
  }
  return dashedLine;
};

exports.slicer = string => {
  return string.slice(0, config.get("settings.paper-width"));
};

exports.columns = cols => {
  const paperWidth = config.get("settings.paper-width");
  let stringLength = 0;
  for (const c of cols) stringLength += c.length;

  if (stringLength > paperWidth) {
    cols[0] = cols[0].slice(0, paperWidth - (cols[1].length + 3));
    stringLength = 0;
    for (const c of cols) stringLength += c.length;
  }

  const size = paperWidth - stringLength;

  let finalString = "";

  let adjs = 0;
  for (let c = 0; c < cols.length; c++) {
    finalString += cols[c];

    if (c < cols.length - 1) {
      if (c == cols.length - 2) adjs = size % 2 && cols.length % 2 ? 1 : 0;
      for (let s = 0; s < size / (cols.length - 1) - adjs; s++)
        finalString += " ";
    }
  }

  return finalString;
};
