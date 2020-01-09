// const path = require('path');
// const rootDir = require('../util/path');

// const products = [];
const Product = require('../models/product');
// const errorTracer = require('../debug/error-tracer');

exports.getAddProduct = (req, res, next)=>{
    // console.log(errorTracer.lineTracer());
    // res.sendFile(path.join(rootDir, 'views', 'add-product.pug'));
    templateData = { 
        pageTitle: 'ADD PRODUCT', 
        isPageFound: false,
        isProductCSS: true,
        isMainCSS: true,
        isShopCSS: false,
    };
    res.render(/*path.join(rootDir, 'views', 'add-product')*/ 'add-product', templateData);
}

exports.postAddProduct = (req, res, next)=>{
    // console.log(errorTracer.lineTracer());
    // console.log(JSON.stringify(req.body));
    if(req.body.title){
        const product = new Product(req.body.title);
        // console.log(product);
        product.save();
        // products.push({title: req.body.title});
        return res.redirect('/');
    }
    res.send('<p>PLEASE ENTER DATA TO SUBMIT!</p>');
}

exports.getProducts = (req, res, next)=>{
    // console.log(errorTracer.lineTracer());
    // console.log(adminData.products);
    // let products = adminData.products;
    // console.log(products.length);
    Product.fetchAll(products=>{
        templateData = {
            prods: products, 
            pageTitle: 'SHOP', 
            isPageFound: false,
            isProductCSS: false,
            isMainCSS: true,
            isShopCSS: true,
            hasProds: products.length>0,
        };
        // console.log(templateData);
        res.render('shop', templateData);
        // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    });
}