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

const port = process.env.port || 3000;

var app = express();

// Pre-Setting for the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
// app.use(express.static(path.join(__dirname, '/../public')));
app.set('view engine','ejs');


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


// Routes

let options;

app.get('/',(req,res) => {
    options = {
        root: __dirname + '/../views/'
    };

    console.log(req.header('x-auth'));

    res.sendFile('index.html',options);
});


app.get('/catalog',(req,res) => {
    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
        data = catalogDataManipulator(data);
        res.send(data);
    });
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
    return;
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

    res.render('specificCourse',{courseInfo,courseRating,courseComments});  
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

                    connection.query(`INSERT INTO users (username,email,password,verified) VALUES ("${verUsername}","${verEmail}","${verPassword}",true)`).then((success) => {
                        connection.query(`SELECT * from users where email="${verEmail}" and password="${verPassword}"`).then((obj) => {
                            token = generateToken(obj.id);
                            console.log(token);
                            verUsername = obj.username;
                            verEmail = obj.email;
                            verCreatedAt = obj.created_at;
                            res.header('x-auth',token).send(`<h1>Email ${mailOptions.to} has been Successfully verified
                                                             <a href="/">HOME PAGE</a>`);
                        });
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


app.post('/loggingIn',(req,res) => {
    let verPassword = saltHashPass(req.body.password);
    
    connection.query(`SELECT * from users where email="${req.body.email}" and password="${verPassword}"`).then((result) => {
        if (!result) {
            return res.send('<h3>Login Failed: User Unidentified</h3>');
        }

        verUsername = result.username;
        verEmail = result.email;
        verCreatedAt = result.created_at;

        token = generateToken(result.id);
        res.header('x-auth',token).redirect('/');

    })
})


app.post('/logout',(req,res) => {
    res.header('x-auth',null).send('<h3>Successfully logged out</h3>');
});




















app.listen(port,() => {
    console.log(`Server is running at ${port}`);
});



// nodemailer connection


// let nodemailer = require('nodemailer');


// let mailOptions;
// let rand;
// let link;


// app.post('/submitUser',(req,res) => {
//     smtpTransport = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true, // secure:true for port 465, secure:false for port 587
//         auth: {
//             user: 'user@myDomain.com',
//             pass: 'pass@pass'
//         }
//     });
    
//     console.log('*******************');
    
//     rand = Math.floor((Math.random() * 100) + 54);

//     link = "http://"+req.get('host')+"/verify?id="+rand;

//     mailOptions = {
//         from: 'WesCourse',
//         to: req.body.email,
//         subject: 'Please confirm your Email Account',
//         html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
//     };

//     smtpTransport.sendMail(mailOptions,(err,res) => {
//         if(err) return console.log(err);
//         console.log("Message sent: " + response.message);
//     });

// });






