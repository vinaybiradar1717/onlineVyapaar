// exports.userSignupValidator = (req, res, next) => {
//     req.check("name", "Name is required").notEmpty()
//     req.check("email", "Email must be between 3 to 32 characters")
//         .matches(/.+\@.+\..+/)
//         .withMessage("Email must conatin @")
//         .isLength({
//             min: 4,
//             max: 32
//         });
//     req.check("password")
//         .isLength({min: 6})
//         .withMessage("Password must contain atleast 6 characters")
//         .matches(/\d/)
//         .withMessage("Password must conatin a number");
//     req.check("password", "Password is required").notEmpty()
    
//     const errors = req.validationErrors();
//     if(errors){
//         const firstError = errors.map(error => error.msg)[0];
//         return res.status(400).json({error: firstError});
//     }
//     next();
// };


exports.userSignupValidator = (req, res, next) => {
    req.check('name', 'Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 64 characters')
        .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        .withMessage('Email must be valid')
        .isLength({
            min: 4,
            max: 64
        });
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number');
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    };
    next();
};