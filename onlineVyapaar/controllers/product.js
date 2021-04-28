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


/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};


// SHOW PHOTO WRT PRODUCT
// ===============================================

exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);  // takes in the data, like: jpg, png etc
        return res.send(req.product.photo.data);
    }
    next();
}