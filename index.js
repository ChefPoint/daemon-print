/* * */
/* * */
/* * * * * */
/* CHEF POINT */
/* PRINT */
/* * */
/* * */

/* Initiate error handling module */
require("./services/errorHandling")();

/* Connect to the database */
require("./services/database")();

/* Start Print module */
require("./app/print")();
