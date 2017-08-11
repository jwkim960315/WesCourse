// Modules
const mysql = require('promise-mysql');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
var upload = multer({ dest: path.join( __dirname,'../uploads/') });
const DataURI = require('datauri').promise;
const rimraf = require('rimraf');


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , session = require('express-session')
  , GoogleStrategy = require('passport-google-oauth2').Strategy;

const port = process.env.PORT || 3000;

var app = express();

// Pre-Setting for the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, '/../views')));
console.log(__dirname);


app.set('view engine','ejs');
app.use(session({ secret: 'a random password!'}));
app.use(passport.initialize());
app.use(passport.session());



// Important Variables

// const courses = JSON.parse(fs.readFileSync(__dirname+'/../db/json/coursesTest.json'));
const courseInfos = JSON.parse(fs.readFileSync(__dirname+'/../json/courseInfosTest.json'));
console.log(__dirname+'/../courseInfosTest.json');
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

console.log(process.env.CLEARDB_DATABASE_HOST);
console.log(process.env.CLEARDB_DATABASE_USER);
console.log(process.env.CLEARDB_DATABASE_PASSWORD);
console.log(process.env.CLEARDB_DATABASE_DATABASE);
console.log(process.env.CLIENT_ID);
console.log(process.env.CLIENT_SECRET);
console.log(process.env.USER_ID_CHECK);


// Heroku Environment Variables 

const host_global = process.env.CLEARDB_DATABASE_HOST;
const user_global = process.env.CLEARDB_DATABASE_USER;
const password_global = process.env.CLEARDB_DATABASE_PASSWORD;
const database_global = process.env.CLEARDB_DATABASE_DATABASE;
const clientID_global = process.env.CLIENT_ID;
const clientSecret_global = process.env.CLIENT_SECRET;
const userIDCheck_global = process.env.USER_ID_CHECK;


// Database Connection

let connection;

mysql.createConnection({
    host: host_global,
    user: user_global,
    password: password_global,
    database: database_global
}).then(function(conn){
    connection = conn;
});





// Google-OAuth2 Passport Middleware
passport.use(new GoogleStrategy({
    clientID: clientID_global,
    clientSecret: clientSecret_global,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

        
        

        
            connection.query(`SELECT * FROM users WHERE users.id=${profile.id}`).then((data,err) => {
                if (profile._json.domain === "wesleyan.edu") {
                    
                    if (err) {
                        
                        return done(err);
                    };

                    

                    if (data.length === 0 && req.query.state !== userIDCheck_global) {
                        connection.query(`INSERT INTO users (id,username,email,first_name,last_name,google_image) VALUES ("${profile.id}","${req.query.state}","${profile.email}","${profile.name.givenName}","${profile.name.familyName}","${profile.photos[0].value}")`);                
                            return done(null, { id: profile.id,
                                                username: req.query.state });  
                    } else if (data.length === 0 && req.query.state === userIDCheck_global) {
                        return done(null,false,{ message: 'You do not have an account',
                                                 type: 'no account' });
                    };

                    

                    if (req.query.state !== userIDCheck_global && req.query.state !== undefined) {
                        return done(null, false, { message: 'You already have an account',
                                                   type: 'duplicate account' });
                    };

                    


                    return done(null, data[0]);

                } else {
                    return done(null,false,{ message: "Domain must be @wesleyan.edu",
                                             type: 'invalid domain' })
                };
        
  });
}));

passport.serializeUser((user, done) => {
    done(null,user.id);
});

passport.deserializeUser((id, done) => {
    connection.query(`SELECT id,username,email,first_name,last_name,google_image,custom_image,use_google_img,DATE_FORMAT(created_at,"%b %d, %Y") as created_date FROM users WHERE id="${id}"`).then((data,err) => {
        done(err,data[0]);
    })
})




// Routes

let options;

app.get('/',(req,res) => {
    

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };

    
    return res.render('home2',{username,
                              image,
                              userLoggedIn});
    

    
});


app.get('/catalog',(req,res) => {

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };

    connection.query('SELECT category,name FROM fields ORDER BY 1,2').then(data => {
        data = catalogDataManipulator(data);
        res.render('catalog2',{data,
                              userLoggedIn,
                              username,
                              image});
    });
});


const course_getter = async (courseName) => {
    return connection.query(`SELECT acronym FROM fields WHERE name="${courseName}"`).then((acronyms) => {
        return acronyms;
    });
};

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

const comments_getter = async (userId,courseAcronym,category,offset) => {
    return connection.query(`SELECT ratings.id,
                                    CASE 
                                        WHEN ratings.anonymous=true THEN "Anonymous"
                                        ELSE username
                                    END as username,
                                    users.username as realUsername,
                                    ratings.comment,
                                    DATE_FORMAT(ratings.created_at,"%b %d, %Y %H:%i:%s") as created_at,
                                    ratings.difficulty,
                                    ratings.organization,
                                    ratings.effort,
                                    ratings.professors,
                                    (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating,
                                    ratings.likes,
                                    users.custom_image,
                                    users.google_image,
                                    users.use_google_img,
                                    CASE
                                        WHEN ratings.recommend=true THEN "Yes"
                                        ELSE "No"
                                    END as recommend,
                                    CASE
                                        WHEN ratings.user_id="${userId}" THEN 1
                                        ELSE 0
                                    END as canEditOrDelete
                             FROM ratings 
                             INNER JOIN courses 
                                ON ratings.course_id = courses.id 
                             INNER JOIN users 
                                ON ratings.user_id = users.id 
                             WHERE courses.course_acronym="${courseAcronym}"
                             ORDER BY ${category}
                             LIMIT ${offset},10`).then((res) => {
        return res;
    }).catch(e => {
        
        return undefined;
    });
};

const comments_getter_not_logged_in = async (courseAcronym,category,offset) => {
    return connection.query(`SELECT ratings.id,
                                    CASE 
                                        WHEN ratings.anonymous=true THEN "Anonymous"
                                        ELSE username
                                    END as username,
                                    users.username as realUsername,
                                    ratings.comment,
                                    DATE_FORMAT(ratings.created_at,"%b %d, %Y %H:%i:%s") as created_at,
                                    ratings.difficulty,
                                    ratings.organization,
                                    ratings.effort,
                                    ratings.professors,
                                    (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating,
                                    ratings.likes,
                                    users.custom_image,
                                    users.google_image,
                                    users.use_google_img,
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
                             ORDER BY ${category}
                             LIMIT ${offset},10`);
};

const user_rating_getter = async (courseAcronym,userId) => {
    return connection.query(`SELECT ratings.id,
                                    CASE 
                                        WHEN ratings.anonymous=true THEN "Anonymous"
                                        ELSE username
                                    END as username,
                                    users.username as realUsername,
                                    ratings.comment,
                                    DATE_FORMAT(ratings.created_at,"%b %d, %Y %H:%i:%s") as created_at,
                                    ratings.difficulty,
                                    ratings.organization,
                                    ratings.effort,
                                    ratings.professors,
                                    (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating,
                                    ratings.likes,
                                    users.custom_image,
                                    users.google_image,
                                    users.use_google_img,
                                    CASE
                                        WHEN ratings.recommend=true THEN "Yes"
                                        ELSE "No"
                                    END as recommend,
                                    CASE
                                        WHEN ratings.user_id="${userId}" THEN 1
                                        ELSE 0
                                    END as canEditOrDelete
                             FROM ratings 
                             INNER JOIN courses 
                                ON ratings.course_id = courses.id 
                             INNER JOIN users 
                                ON ratings.user_id = users.id 
                             WHERE courses.course_acronym="${courseAcronym}"
                             AND ratings.user_id="${userId}"`);
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


app.get('/catalog/:name',async (req,res) => {
    
    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };

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


    res.render('specificField2',{filteredCourses,
                                 fallCourses,
                                 springCourses,
                                 userLoggedIn,
                                 username,
                                 image});
});


const sectionAndPageTypeChecker = (currentSectionNum,currentPageNum) => typeof parseInt(currentSectionNum) === 'number' && typeof parseInt(currentPageNum) === 'number'

const offsetCalc = currentPageNum => (currentPageNum-1)*10

const totalNumPagesCalc = totalNumComments => Math.ceil(totalNumComments/10)

const totalNumSectionsCalc = totalNumPages => Math.ceil(totalNumPages/5)

const currentSectionTotalNumPagesCalc = (currentSectionNum,totalNumSections,totalNumComments) => {
    if (currentSectionNum !== totalNumSections) {
        return 5;
    } else if (currentSectionNum === totalNumSections) {
        let lastSectionTotalNumComments = totalNumComments - (currentSectionNum-1)*50;
        return Math.ceil(lastSectionTotalNumComments/10);
    } else {
        return;
    };
};

const currentSectionPagesNumRangeCalc = (currentSectionNum,currentSectionTotalNumPages) => {
    let currentSectionPagesNumRange = [];
    for (var i=(currentSectionNum-1)*5+1; i <= (currentSectionNum-1)*5+currentSectionTotalNumPages; i++) {
        currentSectionPagesNumRange.push(i);
    };

    return currentSectionPagesNumRange;
};

const previousSectionExistsCalc = currentSectionNum => currentSectionNum !== 1

const nextSectionExistsCalc = (currentSectionNum,totalNumSections) => currentSectionNum !== totalNumSections

const paginationValidChecker = (currentSectionNum,currentPageNum,totalNumSections,totalNumPages,currentSectionTotalNumPages) => {
    if (currentPageNum <= 0 || currentPageNum > totalNumPages) {
        return false;
    } else if (currentSectionNum <= 0 || currentSectionNum > totalNumSections) {
        return false;
    } else if (currentPageNum < (currentSectionNum-1)*5+1 || currentPageNum > (currentSectionNum-1)*5+currentSectionTotalNumPages) {
        return false;
    } else {
        return true;
    };
};

const totalNumCourseCommentsCalc = async (courseId) => {
    return connection.query(`SELECT COUNT(*) as count FROM ratings WHERE ratings.course_id="${courseId}"`).then(data => {
        return data[0].count;
    });
};


const ratingLikesChecker = async (userId,courseId,category,offset) => {
    return connection.query(`SELECT *,CASE 
                                            WHEN likes.user_id="${userId}"
                                            THEN TRUE
                                            ELSE FALSE
                                            END AS haveLiked,
                                      (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating
                                      FROM ratings LEFT JOIN likes ON ratings.id = likes.rating_id
                                      WHERE ratings.course_id=${courseId}
                                      ORDER BY ${category}
                                      LIMIT ${offset},10`);
};

const userRatingLikeChecker = async (userId,courseId) => {
    return connection.query(`SELECT *,CASE 
                                            WHEN likes.user_id="${userId}"
                                            THEN TRUE
                                            ELSE FALSE
                                      END AS haveLiked,
                                      (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating
                                      FROM ratings LEFT JOIN likes ON ratings.id = likes.rating_id
                                      WHERE ratings.course_id=${courseId}
                                      AND ratings.user_id="${userId}"`);
};


app.get('/catalog/:fieldAc/:courseAc/:category',async (req,res) => {

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
        userId = req.user.id;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };

    if (String(req.session.fieldAc) === "true" || String(req.session.courseAc) === "true" || String(req.session.fieldAc) === "false" || String(req.session.courseAc) === "false") {
        let message = "Invalid field acronym or course acronym";
        return res.status(404).render('invalidPage',{ message });
    };

    category = req.params.category;
    

    
    if (!category) {
        category = "likes";
    } else {
        categoryList = ["likes","overall_rating","difficulty","organization","effort","professors","created_at"]
        if (!categoryList.some((catItem,index,arr) => catItem === category)) {
            return res.status(404).send();
        };

        if (category === 'created_at') {
            category = `ratings.${category} DESC`;
        } else {
            category = `${category} DESC`;    
        };

    };

    


    courseAc = req.params.courseAc;
    fieldAc = req.params.fieldAc;
    

    if (!req.session.currentSectionNum && !req.session.currentPageNum) {
        currentPageNum = 1;
        currentSectionNum = 1;
    } else if (req.session.currentSectionNum && req.session.currentPageNum) {
        currentSectionNum = req.session.currentSectionNum;
        currentPageNum = req.session.currentPageNum;
        delete req.session.currentSectionNum;
        delete req.session.currentPageNum;
    } else {
        let message = "Invalid section number or page number";
        return res.render('invalidPage',{ message });
    };

    if (!req.user) {
        courseComments = await comments_getter_not_logged_in(courseAc,category,offsetCalc(currentPageNum));
        userCourseRating = [];
    } else {
        courseComments = await comments_getter(userId,courseAc,category,offsetCalc(currentPageNum));
        userCourseRating = await user_rating_getter(courseAc,userId);
    };

    
    
    courseRating = await ratings_getter(courseAc);
    courseRating = (courseRating.length === 0) ? courseRating : courseRating[0];
    courseInfo = await specific_course_getter(courseAc);
    recommendNum = (courseRating.length === 0) ? undefined : await recommend_number_getter(courseRating.course_id);
    courseOverall = overall_avg_getter(courseRating);
    console.log(courseInfo);
    console.log(req.user);

    
    
    categoryDisplay = "";

    switch(category) {
        case "likes DESC":
            categoryDisplay = "Likes";
            break;
        case "overall_rating DESC":
            categoryDisplay = "Overall Rating";
            break;
        case "difficulty DESC":
            categoryDisplay = "Difficulty";
            break;
        case "organization DESC":
            categoryDisplay = "Organization";
            break;
        case "effort DESC":
            categoryDisplay = "Effort Required";
            break;
        case "professors DESC":
            categoryDisplay = "Professor(s)";
            break;
        case "ratings.created_at DESC":
            categoryDisplay = "Recent";
            break;
    };

    




    let totalNumComments = await totalNumCourseCommentsCalc(courseInfo[0].id),
        offset = offsetCalc(currentPageNum),
        totalNumPages = totalNumPagesCalc(totalNumComments),
        totalNumSections = totalNumSectionsCalc(totalNumPages),
        currentSectionTotalNumPages = currentSectionTotalNumPagesCalc(currentSectionNum,totalNumSections,totalNumComments),
        currentSectionPagesNumRange = currentSectionPagesNumRangeCalc(currentSectionNum,currentSectionTotalNumPages),
        previousSectionExists = previousSectionExistsCalc(currentSectionNum),
        nextSectionExists = nextSectionExistsCalc(currentSectionNum,totalNumSections);

    if (req.user) {
        haveLiked = await ratingLikesChecker(req.user.id,courseInfo[0].id,category,offset);
        userHaveLiked = await userRatingLikeChecker(userId,courseInfo[0].id);
    } else {
        haveLiked = [];
        userHaveLiked = [];
    };


    category = category.slice(0,category.length-5);

    res.render('specificCourse2',{ fieldAc,
                                   courseAc,
                                   courseComments,
                                   courseRating,
                                   courseInfo,
                                   recommendNum,
                                   courseOverall,
                                   currentSectionNum,
                                   currentPageNum,
                                   totalNumPages,
                                   totalNumSections,
                                   currentSectionTotalNumPages,
                                   currentSectionPagesNumRange,
                                   previousSectionExists,
                                   nextSectionExists,
                                   userLoggedIn,
                                   username,
                                   image,
                                   category,
                                   categoryDisplay,
                                   haveLiked,
                                   userCourseRating,
                                   userHaveLiked });
});



app.get('/catalog/:fieldAc/:courseAc/:selectedSectionNum/:selectedPageNum/:category',async (req,res) => {

    selectedPageNum = parseInt(req.params.selectedPageNum);
    selectedSectionNum = Math.ceil(selectedPageNum/5);
    category = req.params.category;
    isSectionAndPageTypeValid = sectionAndPageTypeChecker(selectedSectionNum,selectedPageNum);

    if (!isSectionAndPageTypeValid) {
        let message = "Invalid Section Number Type or Page Number Type";
        return res.status(404).render('invalidPage',{ message });
    };


    fieldAc = req.params.fieldAc;
    courseAc = req.params.courseAc;

    req.session.currentSectionNum = selectedSectionNum;
    req.session.currentPageNum = selectedPageNum;

    return res.redirect(`/catalog/${fieldAc}/${courseAc}/${category}`);
});




app.get('/checkLogin',(req,res) => {

    if (req.user === undefined) {
        return res.send(false);
    };

    res.send(true);
});


const likeInfoGetter = async (ratingId,userId) => {
    return connection.query(`SELECT * FROM likes WHERE rating_id=${ratingId} AND user_id="${userId}"`);
};

const insertNewLike = async (ratingId,userId) => {
    return connection.query(`INSERT INTO likes (rating_id,user_id) VALUES (${ratingId},"${userId}")`);
};

const deleteLike = async (ratingId,userId) => {
    return connection.query(`DELETE FROM likes WHERE user_id="${userId}" AND rating_id=${ratingId}`);
};

const updateLike = async (ratingId,incOrDec) => {
    return connection.query(`UPDATE ratings SET likes = likes ${incOrDec} WHERE id=${ratingId}`);
};

app.get('/like/:fieldAc/:courseAc/:ratingId',async (req,res) => {
    

    if (!req.user) {
        return res.status(404).send();
    };

    let ratingId = parseInt(req.params.ratingId),
        userId = req.user.id,
        inc = '+ 1';

    let inserting = await insertNewLike(ratingId,userId),
        updating = await updateLike(ratingId,inc); 

    res.send(true);

});


app.get(`/unlike/:fieldAc/:courseAc/:ratingId`,async (req,res) => {

    if (!req.user) {
        return res.status(404).send();
    };

    let ratingId = parseInt(req.params.ratingId),
        userId = req.user.id,
        dec = '- 1';

    let deleting = await deleteLike(ratingId,userId),
        updating = await updateLike(ratingId,dec); 

    res.send(true);
})



const unique_user_rating_checker = async (courseAc,userId) => {
    return connection.query(`SELECT COUNT(*) as count 
                             FROM ratings
                             INNER JOIN courses
                                ON ratings.course_id = courses.id
                             WHERE ratings.user_id="${userId}"
                             AND course_acronym="${courseAc}"`);
};


app.get('/comment-submit/:fieldAc/:courseAc/',async (req,res) => {

    if (!req.user) {
        return res.redirect('/login');
    };

    let userRatingIsUnique = await unique_user_rating_checker(req.params.courseAc,req.user.id);

    if (userRatingIsUnique >= 1) {
        return res.status(404).send();
    };

    userLoggedIn = true;
    username = req.user.username;
    image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image; 

    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host');

    res.render('submitRating',{ userLoggedIn,
                                 username,
                                 image });
});

const courseIdFinder = async (courseAc) => {
    return connection.query(`SELECT id FROM courses WHERE course_acronym="${courseAc}"`);
};

const insertRating = async (courseId,userId,difficulty,organization,effort,professors,recommend,comment,anonymous,fieldAc) => {
    return connection.query(`INSERT INTO ratings (difficulty,organization,effort,professors,recommend,course_id,user_id,comment,anonymous,field_acronym) 
                             VALUES (${difficulty},${organization},${effort},${professors},${recommend},${courseId},"${userId}","${comment}",${anonymous},"${fieldAc}")`);
};

const updateRating = async (courseId,userId,difficulty,organization,effort,professors,recommend,comment,anonymous,fieldAc) => {
    return connection.query(`UPDATE ratings SET difficulty=${difficulty},
                                                organization=${organization},
                                                effort=${effort},
                                                professors=${professors},
                                                recommend=${recommend},
                                                comment="${comment}",
                                                anonymous=${anonymous}
                             WHERE user_id="${userId}" AND course_id=${courseId}`);
};

app.post('/submittingRating',async (req,res) => {
    
    if (!req.user) {
        return res.redirect('/login');
    };

    let fieldAc = req.body.fieldAc,
        courseAc = req.body.courseId,
        difficulty = req.body.difficulty,
        organization = req.body.organization,
        effort = req.body.effort,
        professors = req.body.professors,
        recommend = (req.body.option === "Yes") ? true : false,
        comment = (req.body.comment.trim().length === 0) ? "None" : req.body.comment.replace(/\s*$/,""),
        anonymous = (req.body.anonymous === "on") ? true : false,
        userId = req.user.id;

    let courseId = await courseIdFinder(courseAc);
    courseId = courseId[0].id;

    if (req.session.editing) {
        await updateRating(courseId,userId,difficulty,organization,effort,professors,recommend,comment,anonymous,fieldAc);
        delete req.session.editing;
    } else {
        await insertRating(courseId,userId,difficulty,organization,effort,professors,recommend,comment,anonymous,fieldAc);    
    };

    

    let returnTo = req.session.returnTo;
    delete req.session.returnTo;

    if (!returnTo) {
        return res.status(404).send();
    };

    if (returnTo.slice(22,29) === 'catalog') {
        return res.redirect(`/catalog/${fieldAc}/${courseAc}/likes`);
    };

    res.redirect(`profile/${category}`);
    
});

const course_acronym_checker = async courseAc => {
    return connection.query(`SELECT * FROM courses WHERE course_acronym="${courseAc}"`);
};

app.post('/checkCourseAcronym',async (req,res) => {

    if (req.body.courseAc.length === 0) {
        return res.send("noInput");
    };

    let course = await course_acronym_checker(req.body.courseAc);

    if (course.length === 0) {
        return res.send(false);
    };

    res.send(true);
});



app.get('/createUser',(req,res) => {
    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host');
    
    if (req.session.success === undefined) {
        req.session.success = true;    
    };

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };


    let success = req.session.success;
    let invalidMessage = req.session.invalidMessage;
    delete req.session.success;
    delete req.session.invalidMessage;
    res.render('createUser2',{success: [{success}], 
                             invalidMessage: [{invalidMessage}],
                             isSignIn: [{isSignIn: false}],
                             userLoggedIn,
                             username,
                             image});
});


app.get('/login',(req,res) => {
    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host').slice(0,req.get('host').length);

    if (req.session.success === undefined) {
        req.session.success = true;    
    };

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };


    let success = req.session.success;
    let invalidMessage = req.session.invalidMessage;
    delete req.session.success;
    delete req.session.invalidMessage;



    res.render('createUser2',{success: [{success}], 
                             invalidMessage: [{invalidMessage}],
                             isSignIn: [{isSignIn: true}],
                             userLoggedIn,
                             username,
                             image});
});

// Google Sign-In Routes
app.get('/createUser/auth/google', (req,res) => {


    passport.authenticate('google', { 
        hd: 'wesleyan.edu',
        scope: [ 'profile','email' ],
        prompt : "select_account",
        state: req.query.username
    
    })(req,res)
});

app.get('/login/auth/google', (req,res) => {

    passport.authenticate('google', { 
        hd: 'wesleyan.edu',
        scope: [ 'profile','email' ],
        prompt : "select_account",
        state: process.env.USER_ID_CHECK
    })(req,res)
});

// Google Sign-In Callbacks
app.get( '/auth/google/callback', (req,res,next) => {
    passport.authenticate('google',(err, user, info) => {
        if (err) {
            return next(err);
        };

        if (!user && info.type === 'duplicate account') {
            req.session.success = false;
            req.session.invalidMessage = info.message;
            return res.redirect('/createUser');
        } else if (!user && info.type === 'no account') {
            req.session.success = false;
            req.session.invalidMessage = info.message;
            return res.redirect('/login');
        } else if (!user && info.type === 'invalid domain') {
            req.session.success = false;
            req.session.invalidMessage = info.message;
            return res.redirect('/login');
        };

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            };
            res.redirect(req.session.returnTo);
            delete req.session.returnTo;
            delete req.session.success;
            return;
        })
    }) (req,res,next)

});


app.get('/logout',(req,res) => {
    req.logout();
    res.redirect(req.header('Referer') || req.protocol + '://' + req.get('host').slice(0,req.get('host').length));
});

const searched_courses_getter = async (searchParam,offset) => {
    return connection.query(`SELECT * FROM courses WHERE course_name like "%${searchParam}%" OR
                                                  professors like "%${searchParam}%" OR
                                                  course_acronym like "%${searchParam}%" OR
                                                  field_acronym like "%${searchParam}%"
                             ORDER BY field_acronym
                             LIMIT ${offset},10`);
};


const searched_courses_num_getter = async (searchParam,offset) => {
    return connection.query(`SELECT COUNT(*) as count 
                             FROM courses 
                             WHERE course_name like "%${searchParam}%" OR
                                   professors like "%${searchParam}%" OR
                                   course_acronym like "%${searchParam}%" OR
                                   field_acronym like "%${searchParam}%"`);
};




app.get('/search',async (req,res) => {

    if (req.user) {
        userLoggedIn = true;
        username = req.user.username;
        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
    };

    if (!req.session.searchParam) {
        return res.render('search2',{data: undefined, 
                                     currentPageNum: [{currentPageNum: undefined}],
                                     userLoggedIn,
                                     username,
                                     image,
                                     paginationExists: "Not Defined" });
    };

    let searchParam = req.session.searchParam,
        currentSectionNum = parseInt(req.session.currentSectionNum),
        currentPageNum = parseInt(req.session.currentPageNum);

    delete req.session.searchParam;
    delete req.session.currentSectionNum;
    delete req.session.currentPageNum;

    let offset = offsetCalc(currentPageNum),
        searchedCourses = await searched_courses_getter(searchParam,offset),
        totalNumCourses = (await searched_courses_num_getter(searchParam,offset))[0].count,
        totalNumPages = totalNumPagesCalc(totalNumCourses),
        totalNumSections = totalNumSectionsCalc(totalNumPages),
        currentSectionTotalNumPages = currentSectionTotalNumPagesCalc(currentSectionNum,totalNumSections,totalNumCourses),
        currentSectionPagesNumRange = currentSectionPagesNumRangeCalc(currentSectionNum,currentSectionTotalNumPages),
        previousSectionExists = previousSectionExistsCalc(currentSectionNum),
        nextSectionExists = nextSectionExistsCalc(currentSectionNum,totalNumSections);

    if (totalNumCourses === 0) {
        console.log('WHY??????');
        return res.render('search2',{ data: undefined,
                                      currentPageNum: [{currentPageNum: undefined}],
                                      userLoggedIn,
                                      username,
                                      image,
                                      paginationExists: false });
    };
    
    res.render('search2', { paginationExists: true,
                            searchParam,
                            currentSectionNum,
                            currentPageNum,
                            totalNumCourses,
                            totalNumPages,
                            totalNumSections,
                            currentSectionTotalNumPages,
                            currentSectionPagesNumRange,
                            previousSectionExists,
                            nextSectionExists,
                            searchedCourses });
    
});

app.get('/searching',(req,res) => {
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



    req.session.searchParam = req.body.searchParam;
    req.session.currentSectionNum = req.params.sectionNum;
    req.session.currentPageNum = req.params.pageNum;



    res.redirect('/search');

});


app.get('/search/query/:sectionNum/:pageNum/:searchParam',(req,res) => {



    req.session.searchParam = req.params.searchParam;
    req.session.currentSectionNum = req.params.sectionNum;
    req.session.currentPageNum = req.params.pageNum;



    res.redirect('/search');

});




const user_ratings_getter = async (userId,category,offset) => {
    return connection.query(`SELECT *, 
                                    DATE_FORMAT(ratings.created_at,"%b %d, %Y %H:%i:%s") as created_at,
                                    ratings.professors as professors,
                                    (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating,
                                    ratings.id as id
                             FROM ratings
                             INNER JOIN courses
                                   ON courses.id = ratings.course_id 
                             WHERE user_id="${userId}"
                             ORDER BY ${category}
                             LIMIT ${offset},10`);
};

const user_ratings_like_checker = async (userId,category,offset) => {
    return connection.query(`SELECT CASE 
                                         WHEN likes.user_id="${userId}"
                                         THEN TRUE
                                         ELSE FALSE
                                    END AS haveLiked,
                                    (ratings.difficulty+ratings.organization+ratings.effort+ratings.professors)/4 as overall_rating
                             FROM ratings LEFT JOIN likes ON ratings.id = likes.rating_id
                             WHERE ratings.user_id="${userId}"
                             ORDER BY ${category}
                             LIMIT ${offset},10`);
};

const totalNumUserRatingsCalc = async userId => {
    return connection.query(`SELECT COUNT(*) AS count FROM ratings WHERE user_id="${userId}"`);
};


// Profile
app.get('/profile/:category',async (req,res) => {


    if (req.user) { 

        userLoggedIn = true;
        username = req.user.username;

        image = (req.user.use_google_img) ? req.user.google_image : req.user.custom_image;
    } else {
        userLoggedIn = false;
        username = undefined;
        image = undefined;
        return res.redirect('/');
    };

    let fullName = `${req.user.last_name}, ${req.user.first_name}`;


    category = req.params.category;
    currentSectionNum = req.session.currentSectionNum;
    currentPageNum = req.session.currentPageNum;


    if (!category) {
        category = "likes";
    } else {
        
        categoryList = ["likes","overall_rating","difficulty","organization","effort","ratings.professors","created_at"];

        if (!categoryList.some((catItem,index,arr) => catItem === category)) {
            return res.status(404).send();
        };

        if (category === 'created_at' || category === 'professors') {
            category = `ratings.${category} DESC`;
        } else {
            category = `${category} DESC`;    
        };
    };

    if (!req.session.currentSectionNum && !req.session.currentPageNum) {
        currentPageNum = 1;
        currentSectionNum = 1;
    } else if (req.session.currentSectionNum && req.session.currentPageNum) {
        currentSectionNum = req.session.currentSectionNum;
        currentPageNum = req.session.currentPageNum;
        delete req.session.currentSectionNum;
        delete req.session.currentPageNum;
    } else {
        let message = "Invalid section number or page number";
        return res.render('invalidPage',{ message });
    };

    categoryDisplay = "";

    switch(category) {
        case "likes DESC":
            categoryDisplay = "Likes";
            break;
        case "overall_rating DESC":
            categoryDisplay = "Overall Rating";
            break;
        case "difficulty DESC":
            categoryDisplay = "Difficulty";
            break;
        case "organization DESC":
            categoryDisplay = "Organization";
            break;
        case "effort DESC":
            categoryDisplay = "Effort Required";
            break;
        case "ratings.professors DESC":
            categoryDisplay = "Professor(s)";
            break;
        case "ratings.created_at DESC":
            categoryDisplay = "Recent";
            break;
    };



    let offset = offsetCalc(currentPageNum),
        userRatings = await user_ratings_getter(req.user.id,category,offset),
        totalNumUserRatings = await totalNumUserRatingsCalc(req.user.id),
        totalNumPages = totalNumPagesCalc(totalNumUserRatings[0].count),
        totalNumSections = totalNumSectionsCalc(totalNumPages),
        currentSectionTotalNumPages = currentSectionTotalNumPagesCalc(currentSectionNum,totalNumSections,totalNumUserRatings[0].count),
        currentSectionPagesNumRange = currentSectionPagesNumRangeCalc(currentSectionNum,currentSectionTotalNumPages),
        previousSectionExists = previousSectionExistsCalc(currentSectionNum),
        nextSectionExists = nextSectionExistsCalc(currentSectionNum,totalNumSections);

    totalNumUserRatings = totalNumUserRatings[0].count;

    if (req.user) {
        haveLiked = await user_ratings_like_checker(req.user.id,category,offset);
    } else {
        haveLiked = [];
    };

    let customImgExists;

    if (req.user.custom_image === null) {
        customImgExists = false;
    } else {
        customImgExists = true;
    };

    


    category = category.slice(0,category.length-5);

    let paginationExists;

    if (userRatings.length === 0) {
        paginationExists = false;
    } else {
        paginationExists = true;
    };


    delete req.session.image;
    res.render('profile2',{ customImgExists,
                            paginationExists,
                            userLoggedIn,
                            username,
                            image,
                            email: req.user.email,
                            fullName,
                            created_date: req.user.created_date,
                            usingGoogleImg: req.user.use_google_img,
                            userRatings,
                            totalNumUserRatings,
                            totalNumPages,
                            currentSectionNum,
                            currentPageNum,
                            totalNumSections,
                            currentSectionTotalNumPages,
                            currentSectionPagesNumRange,
                            previousSectionExists,
                            nextSectionExists,
                            haveLiked,
                            category,
                            categoryDisplay
                          }
              );
});

app.get('/profile/:selectedSectionNum/:selectedPageNum/:category',(req,res) => {


    selectedPageNum = parseInt(req.params.selectedPageNum);
    selectedSectionNum = Math.ceil(selectedPageNum/5);
    category = req.params.category;
    isSectionAndPageTypeValid = sectionAndPageTypeChecker(selectedSectionNum,selectedPageNum);

    if (!isSectionAndPageTypeValid) {
        let message = "Invalid Section Number Type or Page Number Type";
        return res.render('invalidPage',{ message });
    };

    // console.log('selectedSectionNum: ',selectedSectionNum);
    // console.log('selectedPageNum: ',selectedPageNum);


    // fieldAc = req.params.fieldAc;
    // courseAc = req.params.courseAc;

    req.session.currentSectionNum = selectedSectionNum;
    req.session.currentPageNum = selectedPageNum;

    return res.redirect(`/profile/${category}`);

})


app.post('/checkUsername',(req,res) => {
    if (req.body.username.length === 0) {
        return res.send("noInput");
    };

    connection.query(`SELECT * FROM users WHERE username="${req.body.username}"`).then(data => {
        if (data.length === 0) {
            return res.send(true);
        };

        return res.send(false);
    });
});


app.post('/profile/upload/customImg',upload.single('image'),(req,res) => {
    
    if (!req.user) { 
        return res.redirect('/');
    };


    DataURI(req.file.path).then(content => {
        fs.readdir(path.join(__dirname, '../uploads'), (err,files) => {
            fs.unlink(path.join(__dirname,`../uploads/${files[0]}`),(err) => {
                if (err) {
                    return;
                };

                connection.query(`UPDATE users SET custom_image="${content}",use_google_img=false WHERE id=${req.user.id}`).then(() => {
                    req.session.image = content;
                    res.redirect('/profile/likes');
                });    
            })
        })
            
        
    }).catch(e => console.log(e));
});


app.get('/profile/update/customImg',(req,res) => {

    if (!req.user) { 
        return res.redirect('/');
    };

    connection.query(`UPDATE users SET use_google_img=false WHERE id=${req.user.id}`).then(() => {
        res.redirect('/profile/likes');
    });
})


app.get('/profile/update/googleImg',(req,res) => {

    if (!req.user) { 
        return res.redirect('/');
    };

    connection.query(`UPDATE users SET use_google_img=true WHERE id=${req.user.id}`).then(() => {
        res.redirect('/profile/likes');
    });
});


const userRatingGetter = async (ratingId,userId) => {
    return connection.query(`SELECT 
                                    difficulty,
                                    organization,
                                    effort,
                                    ratings.professors as professors,
                                    recommend,
                                    anonymous,
                                    comment,
                                    courses.course_acronym,
                                    ratings.field_acronym
                             FROM ratings 
                             INNER JOIN courses 
                                ON ratings.course_id=courses.id 
                             WHERE ratings.id=${ratingId} AND user_id="${userId}"`);
};

const deleteUserRating = async (ratingId,userId) => {
    return connection.query(`DELETE FROM ratings WHERE user_id="${userId}" AND ratings.id=${ratingId}`);
};

app.get('/profile/rating/edit/:category/:ratingId',async (req,res) => {

    if (!req.user){
        return res.status(404).send();
    };

    let ratingId = req.params.ratingId,
        userId = req.user.id,
        category = req.params.category;

    let userRating = (await userRatingGetter(ratingId,userId))[0];

    req.session.editing = true;
    req.session.returnTo = req.header('Referer') || req.protocol + '://' + req.get('host');

    res.render('editRating',{ userRating });
});



app.get('/profile/rating/delete/:category/:ratingId',async (req,res) => {
    if (!req.user){
        return res.status(404).send();
    };

    let ratingId = req.params.ratingId,
        userId = req.user.id,
        category = req.params.category;

    await deleteUserRating(ratingId,userId);

    res.redirect(`/profile/${category}`);
});


const deleteUser = async userId => {
    return connection.query(`DELETE FROM users WHERE id="${userId}"`);
};

app.get('/profile/account/delete',async (req,res) => {

    if (!req.user) {
        return res.status(404).send();
    };

    let userId = req.user.id;

    await deleteUser(userId);
    req.logout();
    res.redirect('/');
});



app.get('/catalog/rating/edit/:fieldAc/:courseAc/:category/:ratingId',async (req,res) => {

    if (!req.user){
        return res.status(404).send();
    };

    let ratingId = req.params.ratingId,
        userId = req.user.id,
        category = req.params.category;

    let userRating = (await userRatingGetter(ratingId,userId))[0];

    req.session.editing = true;
    req.session.returnTo = req.header('Referer');

    res.render('editRating',{ userRating });
});

app.get('/catalog/rating/delete/:fieldAc/:courseAc/:category/:ratingId',async (req,res) => {
    if (!req.user){
        return res.status(404).send();
    };

    let ratingId = req.params.ratingId,
        userId = req.user.id,
        category = req.params.category;

    await deleteUserRating(ratingId,userId);

    res.redirect(`/catalog/${req.params.fieldAc}/${req.params.courseAc}/${category}`);
});



app.listen(port,() => console.log(`Server is running at ${port}`));








