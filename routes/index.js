process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
const axios = require('axios').create({});

var accountSid;
var authToken;
var ticketNumber;

var twilio = require('twilio');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(`Twilio Message API Gateway`);
});

router.post('/message', function(req, res, next) {
  let message = req.body.message || 'test message';
  let fromMobile = req.body.from || '+18329812858';
  let toMobile = req.body.to || '+18052083159';
  accountSid = req.body.account_sid;
  authToken = req.body.auth_token;
  ticketNumber = req.body.ticket_number;
  authorization = req.body.authorization;
  //client = new twilio(accountSid, authToken);
  axios.defaults.baseURL = 'https://dpt.theismailiusa.org/api/v2/tickets/';

	axios.defaults.headers['Content-Type'] = 'application/json';

  axios.defaults.headers['Authorization'] = authorization;
  
  console.log('fromMobile:',fromMobile);
  console.log('toMobile:',toMobile);
  console.log('message:',message);
  
  console.log('ticketNumber:',ticketNumber);
  console.log('authorization:',authorization);
  
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
     axios.defaults.baseURL = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/';
			axios.defaults.headers['Authorization'] = 'Basic '+ authToken;
			axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			message = message.replace('{{ticket.zz.message}}', msg);
		  
		
		  axios.post('Messages.json',
		    querystring.stringify({From: fromMobile, To: toMobile, Body: message }))
		  .then(result => {
		    res.json( result.data);
		  }).catch(e => {
		    console.log(e)
		    next();
		  });
  }).catch(e => {
    console.log(e)
    next();
  });
  
 
});
module.exports = router;
