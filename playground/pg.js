const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// var payload = {
//   "iss": "my_issurer",
//   "aud": "World",
//   "iat": 1400062400223,
//   "typ": "/online/transactionstatus/v2",
//   "request": {
//     "myTransactionId": "[myTransactionId]",
//     "merchantTransactionId": "[merchantTransactionId]",
//     "status": "SUCCESS"
//   }
// };
 
// var secret = 'TOPSECRETTTTT';
 
// // encode 
// jwt.encode(secret, payload, function (err, token) {
//   if (err) {
//     console.error(err.name, err.message);
//   } else {
//     console.log('TOKEN: ',token);
 
//     // decode 
//     jwt.decode(secret, token, function (err_, decodedPayload, decodedHeader) {
//       if (err) {
//         console.error(err.name, err.message);
//       } else {
//           console.log('*****************');
//         console.log(decodedPayload, decodedHeader);
//       }
//     });
//   }
// });


// jwt.sign({random:'string'},'SECRET',(err,res) => {
//     console.log(res);
//     jwt.verify(res,'SECRET',(err1,res1) => {
//         console.log(res1);
//     })
// });


let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: 'jwkim0315@gmail.com',
        pass: 
    }
});

let link = "http://host/verify?id=12345";

transporter.sendMail({
    from: 'jwkim0315@gmail.com',
    to: 'jkim11@wesleyan.edu',
    subject: 'Please confirm your Email Account',
    html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
},(err,info) => {
    if (err) {
        return console.log(err);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
})  ;

