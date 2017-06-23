

previousUrlSaver = (req,res) => {
    // console.log(req.get('Referrer'));
    res.locals = req.get('Referrer');
    return res;
};

module.exports = {previousUrlSaver};