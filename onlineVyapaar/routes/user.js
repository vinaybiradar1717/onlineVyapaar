const express = require("express")
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth")
const { userById, read, update } = require("../controllers/user")

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    });
});
// router.get("/user/:userId", requireSignin, isAuth, read); // shows user profile
// router.put("/user/:userId", requireSignin, isAuth, update); // user can update his profile
router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
// act as a middleware
router.param("userId", userById);


module.exports = router;