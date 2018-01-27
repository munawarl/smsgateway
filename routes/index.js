process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express');
var router = express.Router();
var querystring = require('querystring');

var tmsgMark = '$$TICKET_ZZ_MESSAGE';
const axios = require('axios').create({});

var accountSid;
var authToken;
var ticketNumber;

var twilio = require('twilio');

var deskproAPIURL;
var twilioAPIURL;

function callTwilioAPI(message, fromMobile, toMobile, req, res, next) {
	axios.defaults.baseURL = twilioAPIURL + accountSid + '/';
	axios.defaults.headers['Authorization'] = 'Basic '+ authToken;
	axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
	

  axios.post('Messages.json',
    querystring.stringify({From: fromMobile, To: toMobile, Body: message }))
  .then(result => {
    res.json( result.data);
  }).catch(e => {
    console.log(e);
    next();
  });
}

function callDeskProAPI4TicketMsg(message, fromMobile, toMobile, req, res, next) {
	 axios.defaults.baseURL = deskproAPIURL;

	axios.defaults.headers['Content-Type'] = 'application/json';

  axios.defaults.headers['Authorization'] = authorization;
  
  axios.get(ticketNumber + '/messages')
  .then(function(response){
    console.log(response.data); // ex.: { user: 'Your User'}
    console.log(response.status); // ex.: 200
    var msgs = response.data.data;
    var msg = '';
    var size = msgs.length;
    if (msgs != null && size > 0) {
    	msg = msgs[size-1].message;
    	if (msg != null) {
    		msg = msg.replace('<p>','');
    		msg = msg.replace('<br>','');
    		msg = msg.replace('</p>','');
    	}
    }
    message = message.replace(tmsgMark, msg);
    callTwilioAPI(message, fromMobile, toMobile, req, res, next);
		  
     
  }).catch(e => {
    console.log(e);
    next();
  });
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(`Twilio Message API Gateway`);
});

router.post('/message', function(req, res, next) {
  let message = req.body.message || 'test message';
  let fromMobile = req.body.from || '+18329812858';
  let toMobile = req.body.to || '+18052083159';
  accountSid = req.body.twilio_account_sid;
  authToken = req.body.twilio_auth_token;
  ticketNumber = req.body.ticket_number;
  authorization = req.body.deskpro_api_authorization;
  deskproAPIURL = req.body.deskpro_api_url || 'https://dpt.theismailiusa.org/api/v2/tickets/';
  twilioAPIURL = req.body.twilio_api_url || 'https://api.twilio.com/2010-04-01/Accounts/';
 
  
  console.log('fromMobile:',fromMobile);
  console.log('toMobile:',toMobile);
  console.log('message:',message);
  
  console.log('ticketNumber:',ticketNumber);
  console.log('authorization:',authorization);
  
  //Call Twilio API directly if no message call out needed
  if (ticketNumber == null || ticketNumber.length == 0 || message.indexOf(tmsgMark) < 0) {
  	callTwilioAPI(message, fromMobile, toMobile, req, res, next);
  } else {
  	setTimeout(callDeskProAPI4TicketMsg(message, fromMobile, toMobile, req, res, next), 5000);
  }
 
  
 
});
module.exports = router;
