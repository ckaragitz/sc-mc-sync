const express = require('express');
const router = express.Router();

/**
 * Receives run information from the MatLab server, parses it, and inserts
 * into the database that is synced with Salesforce
 */
router.post('/contact', async function(req, res, next) {
  
  console.log("Got contact: " + JSON.stringify());
  console.log("Got the post info");

});

module.exports = router;