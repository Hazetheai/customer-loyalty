const product = require("./product.json");

console.log(JSON.parse(JSON.stringify(JSON.stringify(product, null, 2))));
