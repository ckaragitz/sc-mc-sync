const axios = require('axios');
const FuelAuth = require( 'fuel-auth' );

/// MC Connection /////////////////////////////////////////////

const FuelAuthClient = new FuelAuth(
    {
        clientId: 'yl4fevxqlhm3arbxvmqo2vgl', // required
        clientSecret: '8BG8fwVgWfPW41PrP2EB4cjX', // required
        authUrl: 'https://mcnczz8kss34xnfmts7m1vlr9fz1.auth.marketingcloudapis.com/v2/token',
        grantType: 'client_credentials',
        globalReqOptions: {
            json: {
              grant_type: 'client_credentials',
              client_id: 'yl4fevxqlhm3arbxvmqo2vgl',
              client_secret: '8BG8fwVgWfPW41PrP2EB4cjX'
            }
          }
    }
);

const mcRestUrl = 'https://mcnczz8kss34xnfmts7m1vlr9fz1.rest.marketingcloudapis.com';

/**
 * Function to trigger a send to Marketing Cloud
 * @param {} contact A full contact object that has been validated to live in Service Cloud
 */
async function sendToMC(contact) {
    let authResponse = await FuelAuthClient.getAccessToken();

    const payload = {
        To: {
            'Address': contact.email,
            'SubscriberKey': contact.sfid,
            'ContactAttributes': {
                'SubscriberAttributes': {
                    'Name': contact.Name__c,
                    'Phone': contact.Phone__c
                }
            }
        },
        Options: {
            'RequestType': 'ASYNC'
        }
    };

    let mcResponse = await axios({
        method: 'post',
        url: mcRestUrl + '/messaging/v1/messageDefinitionSends/0c0fd0de-311c-ea11-a2db-1402ec938821/send',
        data: payload,
        headers:{
            'Authorization': 'Bearer ' + authResponse.access_token,
            'Content-Type': 'application/json',
        }
      });

    console.log(JSON.stringify(mcResponse.data.responses));
    return mcResponse;
}

module.exports = {
sendToMC
};