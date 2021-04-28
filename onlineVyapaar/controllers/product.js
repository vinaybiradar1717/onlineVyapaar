const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")
const Product = require("../models/product");
const {errorHandler} = require("../helpers/dbErrorHandler")


// GET A PRODUCT BY USING 'PRODUCTBYID' METHOD
// ============================================

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err, !product) {
            return res.status(400).json({
                error: "Product not found"
            })
        }
        // this will make the product available
        req.product = product;
        next();
    });;
}

// PRODUCT READ METHOD
// ============================

exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}


// PRODUCT CREATE METHOD
//=============================

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()  // Since we get images in product schema we are not using req.body
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        // check for all the fields

        const { name, description, price, category, quantity, shipping } = fields
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields must be filled."
            })
        }

        let product = new Product(fields)
 
        // to handle photo
        if(files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image size should be lesser than 1mb."
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        })

    })
}

// PRODUCT REMOVE(DELETE) METHOD
// ==============================

exports.remove = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({
            "message": "Product deleted successfully"
        })
    })
}


// PRODUCT UPDATE METHOD
// ======================

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()  // Since we get images in product schema we are not using req.body
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        // check for all the fields

        const { name, description, price, category, quantity, shipping } = fields
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields must be filled."
            })
        }

        let product = req.product;
        // extend method is provided by lodash library
        product = _.extend(product, fields);
 
        // to handle photo
        if(files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image size should be lesser than 1mb."
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        })

    })
}


// RECOMMEND PRODUCTS BASED ON SELL/ARRIVAL
// by sell = /products?sortBy=sold&order=desc&limit=4
// by arrival = /products?createdAt=sold&order=desc&limit=4
// if no params are sent then all products are returned
// ======================

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 5;

    Product.find()
        .select("-photo")
        .populate("category")  // in model we have used category in productSchema
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Producs not found!"
                });
            }
            res.json(products);
        })
}


// SHOW RELATED PRODUCTS METHOD
// (other products which have same category will be returned)
// ============================

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 5;
    Product.find({
            _id: {$ne: req.product}, 
            category: req.product.category
        })
        .limit(limit)
        .populate("category", "_id name")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "producs not found!"
                });
            }
            res.json(products);
        });
}


// SHOW RELATED CATEGORIES WRT PRODUCT
// categories related to products will be returned
// ===============================================


exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {  // second field is for query
        if (err) {
            return res.status(400).json({
                error: "categories not found!"
            });
        }
        res.json(categories);
    });
}