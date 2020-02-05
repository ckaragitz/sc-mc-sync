const jsforce = require('jsforce');
const uuid = require('uuid/v1');

const username = process.env.SF_API_USERNAME;
const password = process.env.SF_API_PASSWORD;
const securityToken = process.env.SF_SECURITY_TOKEN;
const conn = new jsforce.Connection();

const queries = require('./db/queries');
const mcService = require('./mc_service');

/// Set up a listener for events hitting the event bus
conn.login(username, password, function(err, res) {
    if (err) {
        return console.error(err);
    }
    console.log('Authenticated with Service Cloud');
    conn.streaming.topic("/event/webform__e").subscribe(function(message) {

        let user = message.payload;
        console.log('Payload User : ' + JSON.stringify(user));

        getUser(user)

    });
});

/**
 * Look up a user from the database, creating them if need be
 * AND triggering a send in Marketing Cloud from this
 * @param {Web Registration User} user 
 */
async function getUser(user) {
    console.log("Looking up: " + user.Email__c);
    let dbUser = await queries.getSingle(user.Email__c);

    if(dbUser){
        console.log("User already exists, only triggering send in MC for" + user.Email__c);
        await mcService.sendToMC(dbUser);
        console.log("Finished triggering send to MC for " + user.Email__c);
    }
    else {
        console.log("Creating new user for " + user.Email__c);
        let userSFID = (await createNewUser(user)).id;
        
        console.log("Done creating new user for " + user.Email__c);
            // Temporary re-naming of fields...
        user.email = user.Email__c;
        user.sfid = userSFID;

        await mcService.sendToMC(user);
        console.log("Finished triggering send to MC");
    }
}

/**
 * Create a new user in Service Cloud, assign them a master ID,
 * then trigger a send to this Contact in Marketing Cloud
 * @param {Web Registration User} user 
 */
async function createNewUser(user) {
    user.external_id__c = uuid();
    console.log("User will have Master ID of " + user.external_id__c);

    let serviceUserBase = { 
      firstname : user.Name__c,
      lastname : user.Name__c,
      email: user.Email__c,
      external_id__c: user.external_id__c,
      mobilephone: user.Phone__c
     };

    return conn.sobject('Contact').create(serviceUserBase, function(err, ret) {
      if (err || !ret.success) { 
        return console.error(err, ret); 
      }
      console.log("Created record : " + ret.id);

      return ret.id;
      
    });

}
