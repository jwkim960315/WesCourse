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
// app.use(express.static(path.join(__dirname, '/../public')));
app.set('view engine','ejs');
app.use(session({ secret: 'a random password!'}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static('public'));


// Important Variables

const courses = JSON.parse(fs.readFileSync(__dirname+'/../db/json/coursesTest.json'));
const courseInfos = JSON.parse(fs.readFileSync(__dirname+'/../db/json/courseInfosTest.json'));
let filteredCourseInfos;



// Temporary Variables

let tmpCategory;
let tmpCourseNames = [];
let renderData = {};
let hashPass;
let token;

// Helper Functions

let catalogDataManipulator = data => {
    tmpCategory = data[0].category;
    for (let i=0;i < data.length;++i) {
        if (data[i].category === tmpCategory) {
            tmpCourseNames.push(data[i].name);
        } else {
            renderData[tmpCategory] = tmpCourseNames;
            tmpCourseNames = [data[i].name];
            tmpCategory = data[i].category;
        }
        
    }
    renderData[tmpCategory] = tmpCourseNames;
    tmpCategory = '';
    tmpCourseNames = [];
    return renderData;
};

let authenticate = (req,res,next) => {
    let reqToken = req.header('x-auth');
    // console.log(reqToken);
    
    if (reqToken !== token) {
        res.status(401).send();
    }
    next();
};

let generateToken = (userId) => {
    return jwt.sign({id: userId},'SECRET');
};

let saltHashPass = (password) => {
    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(password,salt,(err1,hash) => {
            hashPass = hash;
        })
    })
    return hashPass;
};




// Database Connection

let connection;

mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wes_course_test'
}).then(function(conn){
    connection = conn;
});

// Passport Configuration
// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        // passReqToCallback: true
    },
    function (email,password,done) {
                console.log(email);
                console.log(password);
                connection.query(`SELECT * FROM users where email="${email}"`).then((data,err) => {
                    console.log(data);
                    if (err) {
                        return done(err);
                    };
                    // console.log('pass 1');

                    if (data.length === 0) {
                        return done(null,false, { message: 'Incorrect username.'});
                    };
                    // console.log('pass 2');

                    bcrypt.compare(password,data[0].password,(err,result) => {
                        console.log(result);
                        if (result) {
                            // console.log('pass 3'); 
                            return done(null,data[0]);
                        }
                        

                        return done(null,false,{ message: 'Incorrect password.'});
                    });

                    
                });

                

            // });
        // });
        
    }
));

passport.serializeUser((user, done) => {
    done(null,user.id);
});

passport.deserializeUser((id, done) => {
    connection.query(`SELECT * FROM users WHERE id="${id}"`).then((data,err) => {
        done(err,data[0]);
    })
})




// Routes

let options;

app.get('/',(req,res) => {
    options = {
        root: __dirname + '/../views/'
    };

    if (req.user) {
        return res.render('index',{userId: req.user.id});
    };

    res.render('index',{userId: null});

    
});


app.get('/catalog',(req,res) => {
    // if (req.user) {
        connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
            data = catalogDataManipulator(data);
            res.send(data);
        });
    // }
    
});


const course_getter = async (courseName) => {
    return connection.query(`SELECT acronym FROM fields WHERE name="${courseName}"`).then((acronyms) => {
        return acronyms;
    });
};


app.get('/catalog/:name',async (req,res) => {
    courseName = req.params.name;

    acronyms = await course_getter(courseName);
    
    filteredCourses = courseInfos.filter((obj,i,arr) => {
        return obj.field_acronym === acronyms[0].acronym;
    });

    fallCourses = filteredCourses.filter((obj,i,arr) => {
        return obj.term_name.includes('fall');
    });

    springCourses = filteredCourses.filter((obj,i,arr) => {
        return obj.term_name.includes('spring');
    });
    res.render('specificField',{filteredCourses,fallCourses,springCourses});
    // return;
});


const ratings_getter = async (courseAcronym) => {
    return connection.query(`SELECT avg(difficulty) as Difficulty,
                                    avg(organization) as Organization,
                                    avg(effort) as EffortRequired,
                                    avg(ratings.professors) as ProfessorsRating,
                                    CASE
                                    WHEN avg(recommend)>=.5 then "Yes"
                                    ELSE "No"
                                    END as Recommend,
                                    courses.course_acronym
                            from ratings
                            inner join courses
                                on ratings.course_id = courses.id
                            inner join users
                                on users.id = ratings.user_id
                            GROUP BY ratings.course_id
                            HAVING courses.course_acronym="${courseAcronym}"`).then((res) => {
                                    return res;
                                });
};

const specific_course_getter = async (courseAcronym) => {
    return connection.query(`SELECT * FROM courses WHERE course_acronym = "${courseAcronym}"`).then((res) => {
        return res;
    });
};

const comments_getter = async (courseAcronym) => {
    return connection.query(`SELECT * FROM comments INNER JOIN courses ON comments.course_id = courses.id INNER JOIN users ON comments.user_id = users.id HAVING courses.course_acronym = "${courseAcronym}"`).then((res) => {
        return res;
    });
};


app.get('/catalog/:fieldAc/:courseAc',async (req,res) => {
    courseInfo = await specific_course_getter(req.params.courseAc);

    courseRating = await ratings_getter(req.params.courseAc);

    courseComments = await comments_getter(req.params.courseAc);

    console.log(courseInfo);
    console.log(courseRating);
    console.log(courseComments);

    res.render('specificCourse',{courseInfo,courseRating: courseRating[0],courseComments});  
});


app.get('/createUser',(req,res) => {
    res.sendFile('createUser.html',options);
});


// User Creating

// nodemailer

const nodemailer = require('nodemailer');

let host;

app.post('/submitUser',async (req,res) => {

    host = req.get('host');

    verEmail = req.body.email;
    verUsername = req.body.username;
    verPassword = req.body.password;

    if (req.body.email.slice(-12) !== 'wesleyan.edu' || req.body.username.length >= 255 || req.body.password.length >= 80) {
        res.render('submitUser',{success: false});
    } else {
        jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6Inl1c2VvdW5nMSIsImlhdCI6MTQ5NzQ5NjkwMH0.TtTIpFBotfxL1-pQX2wCS2XRofnyB4v4FNdaIH19QMI','SECRET',(err,result) => {
            console.log(typeof result.password);

            transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: 'jwkim0315@gmail.com',
                    pass: result.password
                }
            });

            rand = Math.floor((Math.random() * 100) + 54);

            link = "http://"+req.get('host')+"/verify?id="+rand;

            console.log(verEmail);

            mailOptions = {
                from: 'jwkim0315@gmail.com',
                to: verEmail,
                subject: 'Please confirm your Email Account',
                html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            }

            transporter.sendMail(mailOptions,(err,info) => {
                if (err) {
                    return console.log(err);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.render('submitUser',{success: true});
            });
        

        });


    }
});


app.get('/verify',(req,res) => {
    console.log(req.get('host'));
    console.log(req.protocal);
    if ((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        console.log(req.query.id);
        console.log(rand);
        if (req.query.id == rand) {
            console.log("email is verified");
            bcrypt.genSalt(10,(err,salt) => {
                bcrypt.hash(verPassword,salt,(err1,hash) => {
                    verPassword = hash;
                    console.log(hash);

                    connection.query(`INSERT INTO users (username,email,password) VALUES ("${verUsername}","${verEmail}","${verPassword}")`).then((success) => {
                        console.log(success);
                        // });
                        res.send(`<h1>Email ${mailOptions.to} has been Successfully verified
                                                             <a href="/login">LOGIN PAGE</a>`);

                        
                    });

                });
            });
            
            
        } else {
            console.log("email is not verified");
            res.send("<h1>Bad Request</h1>");
        }
    } else {
        res.send("<h1>Request is from unknown source</h1>");
    }
});





app.get('/login' ,(req,res) => {
    res.sendFile('login.html',options);
});


app.post('/loggingIn',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);


app.get('/logout',(req,res) => {
    req.logout();
    res.redirect('/');
});


app.get('/search',(req,res) => {
    // connection.query(`SELECT * FROM courses WHERE course_name like "%${req.body.searchParam}%" OR
    //                                               section like "%${req.body.searchParam}%" OR
    //                                               professors like "%${req.body.searchParam}%" OR
    //                                               course_acronym like "%${req.body.searchParam}%" OR
    //                                               class_date like "%${req.body.searchParam}%" OR
    //                                               term like "%${req.body.searchParam}%" OR
    //                                               term_name like "%${req.body.searchParam}%" OR
    //                                               field_acronym like "%${req.body.searchParam}%" OR
    //                                               cross_list like "%${req.body.searchParam}%" OR`)
    //     .then(data => {
            res.render('search');
        // });
});

















app.listen(port,() => {
    console.log(`Server is running at ${port}`);
});








