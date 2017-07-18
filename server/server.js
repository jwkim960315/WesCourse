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
  , session = require('express-session')
  , GoogleStrategy = require('passport-google-oauth2').Strategy;

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

// Helper Functions

const catalogDataManipulator = data => {
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

const authenticate = (req,res,next) => {
    let reqToken = req.header('x-auth');
    // console.log(reqToken);
    
    if (reqToken !== token) {
        res.status(401).send();
    }
    next();
};

const generateToken = (userId) => {
    return jwt.sign({id: userId},'SECRET');
};

const saltHashPass = (password) => {
    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(password,salt,(err1,hash) => {
            hashPass = hash;
        })
    })
    return hashPass;
};

const searchingDataHandler = (data) => {
    let tmpLst = [data[0]];
    let res = {}
    res[data[0].field_acronym] = tmpLst;
    data.forEach((obj,index,arr) => {

        if (Object.keys(res).slice(-1)[0] === obj.field_acronym && index !== 0) {
            res[obj.field_acronym].push(obj);
        } else {
            res[obj.field_acronym] = [obj];
        }
    });
    
    return res;  

    
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

// passport.use(new LocalStrategy({
//         usernameField: 'email',
//         passwordField: 'password',
//     },
//     function (email,password,done) {
//                 connection.query(`SELECT * FROM users where email="${email}"`).then((data,err) => {
//                     if (err) {
//                         return done(err);
//                     };

//                     if (data.length === 0) {
//                         return done(null,false, { message: 'Incorrect username.'});
//                     };

//                     bcrypt.compare(password,data[0].password,(err,result) => {
//                         if (result) {
//                             return done(null,data[0]);
//                         }
                        

//                         return done(null,false,{ message: 'Incorrect password.'});
//                     });

                    
//                 });

                
//     }
// ));


// Google-OAuth2 Passport Middleware
passport.use(new GoogleStrategy({
    clientID: "277763886590-097le00059nkdkt4dcv1pif6oirf955k.apps.googleusercontent.com",
    clientSecret: "Ya6_3UPFSEMoMfSDHYRj2Eic",
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

        console.log(profile);
        console.log(accessToken);
        connection.query(`SELECT * FROM users WHERE users.id=${profile.id}`).then((data,err) => {
            console.log(data);
            if (err) {
                console.log(err);
                return done(err);
            };

            console.log(req.query.state);
            console.log(profile.id);

            if (data.length === 0) {                
                connection.query(`INSERT INTO users (id,username,email,first_name,last_name) VALUES ("${profile.id}","${req.query.state}","${profile.email}","${profile.name.givenName}","${profile.name.familyName}")`);                
                return done(null, { id: profile.id,
                                    username: req.query.state });        
            }

            if (req.query.state) {
                return done(null, false, { message: 'You already have an account' });
            };

            console.log(profile._json.verified);

            if (profile._json.domain === "wesleyan.edu") {
                return done(null, data[0]);
            };



            return done(null, false, { message: 'Unknown Error' });

        
        }).catch(e => console.log(e.message));
  }));

passport.serializeUser((user, done) => {
    done(null,user.id);
});

passport.deserializeUser((id, done) => {
    connection.query(`SELECT id,username FROM users WHERE id="${id}"`).then((data,err) => {
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
        return res.render('home',{userId: req.user.id});
    };


    res.render('home',{userId: null});

    
});


app.get('/catalog',(req,res) => {
    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
        data = catalogDataManipulator(data);
        res.render('catalog',{data});
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
    // return;
});


const ratings_getter = async (courseAcronym) => {
    return connection.query(`SELECT ROUND(avg(difficulty),2) as Difficulty,
                                    ROUND(avg(organization),2) as Organization,
                                    ROUND(avg(effort),2) as EffortRequired,
                                    ROUND(avg(ratings.professors),2) as ProfessorsRating,
                                    CASE
                                        WHEN avg(recommend)>=.5 THEN "Yes"
                                        ELSE "No"
                                        END as Recommend,
                                    courses.course_acronym,
                                    course_id
                            from ratings
                            inner join courses
                                on ratings.course_id = courses.id
                            inner join users
                                on users.id = ratings.user_id
                            GROUP BY ratings.course_id
                            HAVING courses.course_acronym="${courseAcronym}"`).then((res) => {
                                    return res;
                                }).catch(e => undefined);
};

const specific_course_getter = async (courseAcronym) => {
    return connection.query(`SELECT * FROM courses WHERE course_acronym = "${courseAcronym}"`).then((res) => {
        return res;
    });
};

const comments_getter = async (courseAcronym,offset) => {
    return connection.query(`SELECT CASE 
                                        WHEN ratings.anonymous=true THEN "Anonymous"
                                        ELSE username
                                    END as username,
                                    comment,
                                    ratings.created_at,
                                    ratings.difficulty,
                                    ratings.organization,
                                    ratings.effort,
                                    ratings.professors,
                                    CASE
                                        WHEN ratings.recommend=true THEN "Yes"
                                        ELSE "No"
                                    END as recommend
                             FROM ratings 
                             INNER JOIN courses 
                                ON ratings.course_id = courses.id 
                             INNER JOIN users 
                                ON ratings.user_id = users.id 
                             WHERE courses.course_acronym="${courseAcronym}"
                             LIMIT ${offset},10`).then((res) => {
        return res;
    }).catch(e => undefined);
};

const overall_avg_getter = data => {
    if (!data) {
        return undefined;
    };
    return ((data.Difficulty + data.Organization + data.EffortRequired + data.ProfessorsRating) / 4).toFixed(2);
};

const recommend_number_getter = async (course_id) => {
    return connection.query(`SELECT CASE WHEN recommend=true THEN 1 ELSE 0 END AS yes,
                                    CASE WHEN recommend=false THEN 1 ELSE 0 END AS no
                             FROM ratings WHERE course_id=${course_id}`).then(res => {
        return res.reduce((init,obj,index,arr) => {
            return {yes: init.yes + obj.yes, no: init.no + obj.no};
        },{yes: 0, no: 0});
    }).catch(e => undefined);
};


app.get('/catalog/:fieldAc/:courseAc/:sectionNum/:pageNum',async (req,res) => {

    let offset = (req.params.pageNum-1)*10;

    

    courseComments = JSON.parse(JSON.stringify(await comments_getter(req.params.courseAc,offset)));

    courseRating = await ratings_getter(req.params.courseAc);

    courseInfo = JSON.parse(JSON.stringify(await specific_course_getter(req.params.courseAc)));
    
    recommendNum = (courseRating.length === 0) ? undefined : JSON.parse(JSON.stringify(await recommend_number_getter(courseRating[0].course_id)));

    courseOverall = overall_avg_getter(courseRating[0]);
    

    

    connection.query(`SELECT count(*) as count FROM ratings 
                      WHERE course_id=${courseInfo[0].id}`)
        .then((totalCount) => {
            courseRating = JSON.parse(JSON.stringify(courseRating));
            // console.log('*****');
            // console.log(data);
            // console.log('*****');
            totalCount = totalCount[0].count;
            let totalSecNum = Math.floor(totalCount/50);
            

            // if (totalCount%50 !== 0) {
                totalSecNum += 1;
            // };

            // console.log(totalSecNum);

            let prevSecExist = req.params.sectionNum !== 1 || req.params.sectionNum <= totalSecNum;

            let nextSecExist = req.params.sectionNum !== totalSecNum;

            let currentSecNum = parseInt(req.params.sectionNum);

            let prevSecNum = currentSecNum-1;
            let nextSecNum = currentSecNum+1;

            // console.log(currentSecNum);
            // console.log(totalSecNum);

            // console.log(typeof currentSecNum);
            // console.log(typeof totalSecNum);

            // console.log(currentSecNum === totalSecNum);

            let currentPageTotalNum;

            if (currentSecNum == totalSecNum) {
                currentPageTotalNum = (totalCount !== 0) ? Math.ceil(totalCount%50/10) : 1;
            } else {
                currentPageTotalNum = 5;
            }
            
            // console.log(currentPageTotalNum);

            console.log('*********************');

            console.log("totalSecNum: ",totalSecNum);
            console.log("currentSecNum: ",currentSecNum);
            console.log("prevSecNum: ",prevSecNum);
            console.log("nextSecNum: ",nextSecNum);
            console.log("currentPageTotalNum: ",currentPageTotalNum);
            console.log("totalCount: ",totalCount);
            console.log("req.params.pageNum: ",req.params.pageNum);

            console.log('*********************');

            // console.log(currentSecNum);


            res.render('specificCourse_test',{courseInfo,
                                              courseRating: courseRating[0], 
                                              courseComments, 
                                              courseOverall, 
                                              recommendNum,
                                              totalSecNum,
                                              currentSecNum:[{currentSecNum}], 
                                              prevSecNum:[{prevSecNum}], 
                                              nextSecNum:[{nextSecNum}], 
                                              currentPageTotalNum: [{currentPageTotalNum}],
                                              totalCount: [{totalCount}],
                                              currentPageNum: [{currentPageNum: req.params.pageNum}],
                                              fieldAc: [{fieldAc: req.params.fieldAc}],
                                              courseAc: [{courseAc: req.params.courseAc}],
                                              pageNum: [{pageNum: req.params.pageNum}]});


        });

      
});




app.get('/checkLogin',(req,res) => {

    if (req.user === undefined) {
        console.log('it is undefined');
        return res.send(false);
    }

    res.send(true);
})











app.post('/comment/submit/:fieldAc/:courseAc/:courseId/:sectionNum/:pageNum',(req,res) => {
    
    

    if (!req.user) {
        return res.redirect('/login');
    };


    let difficulty = req.body.difficulty,
        organization = req.body.organization,
        effort = req.body.effort,
        professors = req.body.professors,
        anonymous = req.body.optionsRadios1,
        recommend = req.body.optionsRadios2,
        comment = req.body.comment,
        userId = req.user.id,
        username = req.user.username,
        courseId = req.params.courseId,
        courseAc = req.params.courseAc,
        fieldAc = req.params.fieldAc;

        // console.log(difficulty);
        // console.log(organization);
        // console.log(effort);
        // console.log(professors);
        console.log(anonymous);
        console.log(recommend);
        // console.log(comment);
        // console.log(userId);
        // console.log(username);
        // console.log(courseId);
        // console.log(courseAc);
        // console.log(fieldAc);

    

    if (comment.trim() === "") {
        comment = "None";
    };

    recommend = (recommend ==="yes") ? 1 : 0;
    anonymous = (anonymous === "yes") ? 1 : 0;
    
    connection.query(`INSERT INTO ratings (difficulty,organization,effort,professors,recommend,comment,anonymous,course_id,user_id) VALUES (${difficulty},${organization},${effort},${professors},${recommend},"${comment}",${anonymous},${courseId},${userId})`).then((success) => {
        res.redirect(`/catalog/${fieldAc}/${courseAc}/${req.params.sectionNum}/${req.params.pageNum}`);
    });


    


});




app.get('/createUser',(req,res) => {
    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host');
    console.log(req.session.returnTo);
    res.render('createUser',{success: [{success:true}], invalidMessage: undefined});
});


app.get('/login',(req,res) => {
    console.log("Return to :"+req.session.returnTo);
    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host');
    console.log(req.session.returnTo);
    console.log(req.session.err);
    res.render('createUser',{success: [{success:true}], invalidMessage: [{invalidMessage:"Invalid Username and/or Password"}]});
});

// Google Sign-In Routes
app.get('/createUser/auth/google', (req,res) => {

    // console.log(req.body.username);
    // console.log(req.query.username);
    // console.log(req.params.username);

    passport.authenticate('google', { 
        hd: 'wesleyan.edu',
        scope: [ 'profile','email' ],
        prompt : "select_account",
        state: req.query.username
    
    })(req,res)
});

app.get('/login/auth/google', (req,res) => {

    // console.log(req.body.username);
    // console.log(req.query.username);
    // console.log(req.params.username);

    passport.authenticate('google', { 
        hd: 'wesleyan.edu',
        scope: [ 'profile','email' ],
        prompt : "select_account"
    })(req,res)
});

// Google Sign-In Callbacks
app.get( '/auth/google/callback', (req,res,next) => {
    passport.authenticate('google',(err, user, info) => {
        console.log(info);
        if (err) {
            return next(err);
        };

        if (!user) {
            req.session.err = true;
            return res.redirect('/login');
            // return res.render('createUser',{success: [{success:false}], invalidMessage: [{invalidMessage: info.message}]});
        };

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            };
            console.log('redirected successfully');
            res.redirect(req.session.returnTo);
            delete req.session.returnTo;
            return;
        })
    }) (req,res,next)

});


// app.post('/loggingIn',(req,res,next) => {
//     passport.authenticate('local',(err, user, info) => {
//         if (err) {
//             return next(err);
//         };

//         if (!user) {
//             return res.render('login',{success: [{success:false}], invalidMessage: [{invalidMessage:"Invalid Username and/or Password"}]});
//         };

//         req.logIn(user, (err) => {
//             if (err) {
//                 return next(err);
//             };
//             res.redirect(req.session.returnTo);
//             delete req.session.returnTo;
//             return;
//         })
//     }) (req,res,next)
// });


app.get('/logout',(req,res) => {
    req.logout();
    res.redirect('/');
});


app.get('/search',(req,res) => {
    res.render('search_test',{data: undefined, currentPageNum: [{currentPageNum: undefined}]});
});

app.get('/searching',(req,res) => {
    // console.log(req.query.keyword);
    if (!req.query.keyword) {
        return res.send(undefined);
    };

    if (req.query.keyword === "," || req.query.keyword === "." || req.query.keyword === ";") {
        return res.send("-1");
    };

    connection.query(`SELECT * FROM courses WHERE course_name like "%${req.query.keyword}%" OR
                                                  professors like "%${req.query.keyword}%" OR
                                                  course_acronym like "%${req.query.keyword}%" OR
                                                  field_acronym like "%${req.query.keyword}%"
                     ORDER BY field_acronym
                     LIMIT 10`)
        .then(data => {
            connection.query(`SELECT count(*) as count FROM courses WHERE course_name like "%${req.query.keyword}%" OR
                                                                          professors like "%${req.query.keyword}%" OR
                                                                          course_acronym like "%${req.query.keyword}%" OR
                                                                          field_acronym like "%${req.query.keyword}%"`)
                .then(dataLength => {
                    
                    dataLength = dataLength[0].count;
                    data = searchingDataHandler(JSON.parse(JSON.stringify(data)));
                    res.send({data,dataLength});
                }).catch(e => res.send("-1"));
        }).catch((e) => res.send("-1"));
});

app.post('/search/query/:sectionNum/:pageNum',(req,res) => {
    console.log(req.params.pageNum);
    console.log(req.body.searchParam);
    // console.log(req.body.keyword);
    if (req.body.searchParam === "") {
        res.render('search_test',{data: -1});
    };

    let offset = (req.params.pageNum-1)*10;

    // tmp = req.body.searchParam;

    connection.query(`SELECT * FROM courses WHERE course_name like "%${req.body.searchParam}%" OR
                                                  professors like "%${req.body.searchParam}%" OR
                                                  course_acronym like "%${req.body.searchParam}%" OR
                                                  field_acronym like "%${req.body.searchParam}%"
                     ORDER BY course_acronym
                     LIMIT ${offset},10`)
        .then(data => {
            // console.log(data);
            if (data.length === 0) {

                return res.render('search_test',{data: -1});
            };

            connection.query(`SELECT count(*) as count FROM courses WHERE course_name like "%${req.body.searchParam}%" OR
                                                                 professors like "%${req.body.searchParam}%" OR
                                                                 course_acronym like "%${req.body.searchParam}%" OR
                                                                 field_acronym like "%${req.body.searchParam}%"
                              ORDER BY course_acronym`)
                .then((totalCount) => {
                    data = JSON.parse(JSON.stringify(data));
                    totalCount = totalCount[0].count;
                    let totalSecNum = Math.floor(totalCount/50);
                    

                    // if (totalCount%50 !== 0) {
                        totalSecNum += 1;
                    // };

                    // console.log(totalSecNum);

                    let prevSecExist = req.params.sectionNum !== 1 || req.params.sectionNum <= totalSecNum;

                    let nextSecExist = req.params.sectionNum !== totalSecNum;

                    let currentSecNum = parseInt(req.params.sectionNum);

                    let prevSecNum = currentSecNum-1;
                    let nextSecNum = currentSecNum+1;

                    // console.log(currentSecNum);
                    // console.log(totalSecNum);

                    // console.log(typeof currentSecNum);
                    // console.log(typeof totalSecNum);

                    // console.log(currentSecNum === totalSecNum);

                    let currentPageTotalNum;

                    if (currentSecNum == totalSecNum) {
                        currentPageTotalNum = (totalCount !== 0) ? Math.ceil(totalCount%50/10) : 1;
                    } else {
                        currentPageTotalNum = 5;
                    }
                    
                    // console.log(currentPageTotalNum);

                    console.log('*********************');

                    console.log("totalSecNum: ",totalSecNum);
                    console.log("currentSecNum: ",currentSecNum);
                    console.log("prevSecNum: ",prevSecNum);
                    console.log("nextSecNum: ",nextSecNum);
                    console.log("currentPageTotalNum: ",currentPageTotalNum);
                    console.log("totalCount: ",totalCount);
                    console.log("req.params.pageNum: ",req.params.pageNum);

                    console.log('*********************');

                    console.log(currentSecNum);
                    res.render('search_test',{data, 
                                             totalSecNum, 
                                             currentSecNum:[{currentSecNum}], 
                                             prevSecNum:[{prevSecNum}], 
                                             nextSecNum:[{nextSecNum}], 
                                             currentPageTotalNum: [{currentPageTotalNum}],
                                             searchParam: [{searchParam: req.body.searchParam}],
                                             totalCount: [{totalCount}],
                                             currentPageNum: [{currentPageNum: req.params.pageNum}]
                                             });
                });
        });
});

app.get('/search/query/:sectionNum/:pageNum/:searchParam',(req,res) => {

    // req.body.searchParam = tmp;

    let offset = (req.params.pageNum-1)*10;
    // console.log(offset);

    connection.query(`SELECT * FROM courses WHERE course_name like "%${req.params.searchParam}%" OR
                                                  professors like "%${req.params.searchParam}%" OR
                                                  course_acronym like "%${req.params.searchParam}%" OR
                                                  field_acronym like "%${req.params.searchParam}%"
                     ORDER BY course_acronym
                     LIMIT ${offset},10`)
        .then(data => {
            if (data.length === 0) {
                return res.render('search_test',{data: -1});
            };
            connection.query(`SELECT count(*) as count FROM courses WHERE course_name like "%${req.params.searchParam}%" OR
                                                                 professors like "%${req.params.searchParam}%" OR
                                                                 course_acronym like "%${req.params.searchParam}%" OR
                                                                 field_acronym like "%${req.params.searchParam}%"
                              ORDER BY course_acronym`)
                .then((totalCount) => {
                    data = JSON.parse(JSON.stringify(data));
                    totalCount = totalCount[0].count;
                    let totalSecNum = Math.floor(totalCount/50);
                    

                    // if (totalCount%50 !== 0) {
                        totalSecNum += 1;
                    // };

                    // console.log(totalSecNum);

                    let prevSecExist = req.params.sectionNum !== 1 || req.params.sectionNum <= totalSecNum;

                    let nextSecExist = req.params.sectionNum !== totalSecNum;

                    let currentSecNum = parseInt(req.params.sectionNum);

                    let prevSecNum = currentSecNum-1;
                    let nextSecNum = currentSecNum+1;

                    // console.log(currentSecNum);
                    // console.log(totalSecNum);

                    // console.log(typeof currentSecNum);
                    // console.log(typeof totalSecNum);

                    // console.log(currentSecNum === totalSecNum);

                    let currentPageTotalNum;

                    if (currentSecNum == totalSecNum) {
                        currentPageTotalNum = (totalCount !== 0) ? Math.ceil(totalCount%50/10) : 1;
                    } else {
                        currentPageTotalNum = 5;
                    }
                    
                    // console.log(currentPageTotalNum);

                    console.log('*********************');

                    console.log("totalSecNum: ",totalSecNum);
                    console.log("currentSecNum: ",currentSecNum);
                    console.log("prevSecNum: ",prevSecNum);
                    console.log("nextSecNum: ",nextSecNum);
                    console.log("currentPageTotalNum: ",currentPageTotalNum);
                    console.log("totalCount: ",totalCount);
                    console.log("req.params.pageNum: ",req.params.pageNum);

                    console.log('*********************');


               

                    res.render('search_test.ejs',{data, 
                                             totalSecNum, 
                                             currentSecNum:[{currentSecNum}], 
                                             prevSecNum:[{prevSecNum}], 
                                             nextSecNum:[{nextSecNum}], 
                                             currentPageTotalNum: [{currentPageTotalNum}],
                                             searchParam: [{searchParam: req.params.searchParam}],
                                             totalCount: [{totalCount}],
                                             currentPageNum: [{currentPageNum: req.params.pageNum}]
                                             });
                });
        });
});






app.post('/checkUsername',(req,res) => {
    console.log(req.body.username.length);
    if (req.body.username.length === 0) {
        return res.send("noInput");
    };

    connection.query(`SELECT * FROM users WHERE username="${req.body.username}"`).then(data => {
        console.log(data);
        if (data.length === 0) {
            return res.send(true);
        };

        return res.send(false);
    })
});






app.listen(port,() => {
    console.log(`Server is running at ${port}`);
});








