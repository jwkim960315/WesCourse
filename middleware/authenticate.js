let authenticate = (req,res,next) => {
    let reqToken = req.header('x-auth');
    
    if (reqToken !== token) return Promise.reject();
    next();
};

let generateToken = (userId) => {
    return jwt.sign({id: userId},'SECRET');
};

let saltHashPass = (password) => {
    let hashPass;
    bcrypt.genSalt(30,(err,salt) => {
        bcrypt.hash(password,salt,(err1,hash) => {
            hashPass = hash;
        })
    })
    return hashPass;
};