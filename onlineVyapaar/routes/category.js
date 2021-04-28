const express = require("express")
const router = express.Router()

const { create, categoryById, read, update, remove, list } = require("../controllers/category")
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth")
const { userById } = require("../controllers/user")
// const { update } = require("../controllers/product")


router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);
router.get("/category/:categoryId", read);
router.put("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, update);
router.delete("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, remove);
router.get("/categorys", list);



// act as a middleware
// So whenever there is 'categoryId' in the route we will run 
// categoryById to get respective category (same applies to user) 
router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;