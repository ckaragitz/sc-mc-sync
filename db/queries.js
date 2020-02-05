var knex = require('./knex.js');

function Contact() {
  return knex('salesforce.contact');
}
  
function getSingle(emailToCheck) {
  return Contact().where('email', emailToCheck).first();
}

module.exports = {
  getSingle
};