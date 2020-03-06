/* * */
/* * */
/* * * * * */
/* PRINT API */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const escpos = require("escpos");

/* * */
/* THIS FUNCTION WILL CONNECT TO THE PRINTER */
exports.printDocument = async invoice => {
  // Select the adapter based on your printer type
  const device = new escpos.USB();
  const options = { encoding: "ascii" };
  const printer = new escpos.Printer(device, options);

  device.open(function() {
    /* Header */
    printer
      /* */ .align("ct")
      /* */ .size(2, 2)
      /* */ .text("CHEF POINT")
      /* */ .size(1, 1)
      /* */ .feed(1)
      /* */ .text("VMRT Food Services, Lda")
      /* */ .text("PT 513 181 237");

    /* Invoice Details */
    printer
      /* */ .align("lt")
      /* */ .text(drawLine())
      /* */ .text(invoice.number)
      /* */ .text(invoice.system_time)
      /* */ .text(drawLine());

    /* Customer Details */
    printer
      /* */ .text(trim("Nome: " + invoice.client.name))
      /* */ .text(trim("NIF: " + invoice.client.fiscal_id))
      /* */ .text(drawLine());

    /* Items Breakdown */
    printer
      /* */ .text(drawColumns(["Produto", "Total"]))
      /* */ .text("  Qtd. x Preco (IVA)")
      /* */ .text(drawDashedLine())
      /* */ .text(drawItemsBreakdown(invoice.items))
      /* */ .text(drawLine());

    /* Payment Breakdown */
    printer
      /* */ .feed(1)
      /* */ .text(drawColumns(["Subtotal", invoice.amount_net]))
      /* */ .text(
        drawColumns(["IVA", invoice.taxes ? invoice.taxes[0].amount : "-"])
      )
      /* */ .size(1, 2)
      /* */ .text(drawColumns(["TOTAL", "EURO " + invoice.amount_gross]))
      /* */ .size(1, 1)
      /* */ .feed(1);

    /* Taxes Breakdown */
    if (invoice.taxes)
      printer
        /* */ .text(drawLine())
        /* */ .text(drawColumns(["%", "Base", "IVA"]))
        /* */ .text(drawDashedLine())
        /* */ .text(drawTaxesBreakdown(invoice.taxes));

    /* Validity Check */
    printer
      /* */ .text(drawLine())
      /* */ .feed(1)
      /* */ .align("ct")
      /* */ .text(invoice.hash + " - Processado por")
      /* */ .text("programa certificado")
      /* */ .text("numero 2230/AT")
      /* */ .feed(2);

    /* Cut Paper */
    if (config.get("settings.cut-paper"))
      printer
        /* */ .cut();

    /* Finalize Print Session */
    printer
      /* */ .close();
  });
};

//
//
// HELPER METHODS

const drawLine = () => {
  let line = "";
  for (let pw = 0; pw < config.get("settings.paper-width"); pw++) line += "-";
  return line;
};

const drawDashedLine = () => {
  let dashedLine = "";
  for (let pw = 0; pw < config.get("settings.paper-width"); pw++) {
    dashedLine += pw % 2 ? " " : "-";
  }
  return dashedLine;
};

const drawItemsBreakdown = items => {
  let finalString = "";
  for (const i of items) {
    const line1 = drawColumns([i.title, i.amounts.net_total]);
    const line2 =
      "  " +
      i.qty +
      " x " +
      (i.amounts.net_unit
        ? i.amounts.net_unit
        : "0.00" + " (" + i.tax.rate + "%)");
    finalString += line1 + "\n" + line2 + "\n";
  }
  return trim(finalString, finalString.length - 1);
};

const drawTaxesBreakdown = taxes => {
  if (!taxes) return;
  let finalString = "";
  for (const t of taxes) {
    finalString += drawColumns([t.rate + "%", t.base, t.amount]) + "\n";
  }
  return trim(finalString, finalString.length - 1);
};

const drawColumns = cols => {
  const paperWidth = config.get("settings.paper-width");
  let stringLength = 0;
  for (const c of cols) stringLength += c.length;

  if (stringLength > paperWidth) {
    cols[0] = trim(cols[0], paperWidth - (cols[1].length + 3));
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

const trim = (string, limit = config.get("settings.paper-width")) => {
  return string.slice(0, limit);
};
