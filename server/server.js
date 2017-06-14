// Modules
const mysql = require('promise-mysql');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const html = require('html');

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

    res.sendFile('index.html',options);
});


app.get('/catalog',(req,res) => {
    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
        // console.log('catalog running');
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
    console.log(req.protocol);
    console.log(req.get('host'));
    res.sendFile('createUser.html',options);
});


// User Creating

// nodemailer

const nodemailer = require('nodemailer');




app.post('/submitUser',(req,res) => {
    // console.log(req.body.email.length);
    
    if (req.body.email.slice(-12) !== 'wesleyan.edu' || req.body.username.length >= 255 || req.body.password.length >= 80) {
        res.render('submitUser',{success: false});
    } else {
        





    }
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

// app.get('/verify',(req,res) => {
//     if ((req.protocol+"://"+req.get('host'))==("http://"+host)) {
//         console.log("Domain is matched. Information is from Authentic email");
//         if(req.query.id==rand) {
//             console.log("email is verified");
//             res.send("<h1>Email "+mailOptions.to+" is been Successfully verified");
//         } else {
//             console.log("email is not verified");
//             res.send("<h1>Bad Request</h1>");
//         }
//     } else {
//         res.send("<h1>Request is from unknown source");
//     }
// });




