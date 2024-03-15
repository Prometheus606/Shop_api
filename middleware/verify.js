const jwt = require('jsonwebtoken')

const verify = (req, res, next) => {
    try {
        if (!req.cookies.token) {
            return res.json({ success: false, error: "You are not logged in."});
        }
    
        const token = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        req.user = token.user

        if (req.params.id && req.params.id != req.user.id) {
            return res.json({ success: false, error: "You can only access your own id."});
        }
    
        next()
    } catch (error) {
        const err = { success: false, error: "You are not logged in."};
        console.log(err, error);
        res.json(err);
    }

}

module.exports = verify