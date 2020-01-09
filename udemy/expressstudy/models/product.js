// module.exports = function Product(){

// }
// const errorTracer = require('../debug/error-tracer');
const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename),
    'data',
    'products.json');

const getProductsFromFile = cb => {
    // console.log(errorTracer.lineTracer());
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    })

}

module.exports = class Product {
    constructor(title) {
        // console.log(errorTracer.lineTracer());
        this.title = title;
    }

    save() {
        // console.log(errorTracer.lineTracer());
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                if (err) {
                    console.log(err);
                }
            })
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}