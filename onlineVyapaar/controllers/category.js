const Category = require("../models/category");
const {errorHandler} = require("../helpers/dbErrorHandler")


// GET A CATEGORY BY USING 'CATEGORYBYID' METHOD
// ============================================

exports.categoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if(err, !category) {
            return res.status(400).json({
                error: "category not found"
            })
        }
        // this will make the category available
        req.category = category;
        next();
    });;
}


// CREATE A CATEGORY
// ==========================

exports.create = (req, res) => {
    const category = new Category(req.body);
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({data});
    })
}

// CATEGORY READ METHOD
// ============================

exports.read = (req, res) => {
    return res.json(req.category);
}

// CATEGORY UPDATE METHOD
// ============================

exports.update = (req, res) => {
    const category = req.category;
    category.name = req.body.name;
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    })
}

// exports.update = (req, res) => {
//     const category=req.category
//     category.name= req.body.name
//     category.save((err,data)=>{
//         if(err){
//             return res.status(400).json({
//                 error:errorHandler(err)
//             })

//         }
//         res.json(data);
//     })
// }
// CATEGORY REMOVE METHOD
// ============================

exports.remove = (req, res) => {
    const category = req.category;
    category.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            "message": "Category deleted successfully"
        })
    })
}

// LIST ALL CATEGORIES
// ============================

exports.list = (req, res) => {
    Category.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    })
}