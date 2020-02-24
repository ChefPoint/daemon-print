/* * */
/* * */
/* * * * * */
/* PRINT */
/* * */
/* * */

/* * */
/* IMPORTS */
const config = require("config");
const mongoose = require("mongoose");
const logger = require("../services/logger");
const vendusAPI = require("../services/vendusAPI");
const printAPI = require("../services/printAPI");
const { PrintQueue } = require("../models/PrintQueue");

/* * */
/* At program initiation find matching documents from the PrintQueue */
/* and, for each document matching this store's location ID, print it. */
module.exports = async () => {
  // Log progress
  logger.info("Starting...");
  // Get this store's documentIDs
  const printQueue = await PrintQueue.find({
    location_id: config.get("settings.location-id")
  });

  if (printQueue.length) {
    // Log progress
    logger.info("Preparing to print " + printQueue.length + " documents.");
    logger.info("Fetching invoices...");
    // For each document in the print queue,
    for (const document of printQueue) {
      // get it's document from Vendus API,
      await getInvoiceAndPrint(document.invoice_id);
      // and remove the document from the print queue
      await document.remove();
    }
  } else logger.info("No invoices to print.");

  // Disconnect from the database after program completion
  await mongoose.disconnect();
  logger.info("Disconnected from MongoDB.");
};

/* * */
/* Request the Vendus API for the given invoice document. */
const getInvoiceAndPrint = async invoiceID => {
  // Set the request params
  const params = {
    method: "GET",
    url: vendusAPI.setAPIEndpoint("documents/" + invoiceID),
    auth: { user: config.get("auth.vendusAPI") }
  };

  await vendusAPI
    .request(params)
    // If successful,
    .then(async invoice => {
      // print the document
      printAPI.printDocument(invoice);
    })
    // If an error occurs,
    .catch(error => {
      // Log the error
      logger.error(
        "Error occured while getting invoice.",
        "Invoice ID: " + invoiceID,
        error
      );
    });
};
