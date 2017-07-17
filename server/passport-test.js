// Modules
const mysql = require('promise-mysql');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const html = require('html');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , session = require('express-session');

const port = process.env.port || 3000;

var app = express();

// Pre-Setting for the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, '/../views')));
console.log(__dirname);

// console.log(path.join(__dirname,'/../public'));
app.set('view engine','ejs');
app.use(session({ secret: 'a random password!'}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(routes.index);
// app.use(express.static('public'));


// Important Variables

const courses = JSON.parse(fs.readFileSync(__dirname+'/../db/json/coursesTest.json'));
const courseInfos = JSON.parse(fs.readFileSync(__dirname+'/../db/json/courseInfosTest.json'));
let filteredCourseInfos;

const {previousUrlSaver} = require(__dirname+'/../middleware/middleware'); 



// Temporary Variables

let tmpCategory;
let tmpCourseNames = [];
let renderData = {};
let hashPass;
let token;

let connection;

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wes_course_test'
}).then(function(conn){
    connection = conn;
});

// Passport Serializer & Deserializer
passport.serializeUser((user, done) => {
    done(null,user.id);
});

passport.deserializeUser((id, done) => {
    connection.query(`SELECT id,username FROM users WHERE id="${id}"`).then((data,err) => {
        done(err,data[0]);
    })
})



// Google Passport
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: "277763886590-097le00059nkdkt4dcv1pif6oirf955k.apps.googleusercontent.com",
    clientSecret: "Ya6_3UPFSEMoMfSDHYRj2Eic",
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

        console.log(profile);
        connection.query(`SELECT * FROM users where email="${profile.email}"`).then((data,err) => {
            if (err) {
                return done(err);
            };

            if (data.length === 0) {
                return done(err);
            };

            if (profile._json.hd === "wesleyan.edu") {
                return done(null,profile);
            };

        
        }).catch(e => console.log(e.message));
  }));





// Routes


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login',
//                                             'https://www.googleapis.com/auth/plus.profile.emails.read']}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

app.get('/auth/google',
  passport.authenticate('google', { 
    hd: 'wesleyan.edu',
    scope: [ 'https://www.googleapis.com/auth/plus.login',
             'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/auth/google/failure'
}));



// app.get('/auth/google/callback', 
//   passport.authenticate('google', { 
//     hd: 'wesleyan.edu',
//     failureRedirect: '/login' 
//   }),
//   function(req, res) {
//     res.redirect('/');
//   });

app.get('/',(req,res) => {
    res.render('passport-test',{});
})


app.listen(port,() => {
    console.log(`Server listening on ${port}`);
})