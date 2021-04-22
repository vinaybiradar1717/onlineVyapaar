const express = require("express")
const router = express.Router()

const { signup } = require("../controllers/user")

// router.get("/", (req, res) => {
//     res.send("hello from userRoutes");
// });

router.get("/", signup);

module.exports = router;