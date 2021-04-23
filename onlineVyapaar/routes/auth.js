const express = require("express")
const router = express.Router()

const { signup, signin, signout, requireSignin } = require("../controllers/auth")
const { userSignupValidator } = require("../validator")

// router.get("/", (req, res) => {
//     res.send("hello from userRoutes");
// });

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);


// This is to restrict user to route if he has not been signed in
// router.get("/hello", requireSignin, (req, res) => {
//     res.send("hello there")
// })

module.exports = router;