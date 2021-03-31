const dotenv = require("dotenv");
const Shopify = require("shopify-api-node");
const axios = require("axios");
var valvelet = require("valvelet");
const readline = require("readline");
const fs = require("fs");
dotenv.config({ path: "../../.env" });

const STORE_NAME = "stefar";
const MIN_ORDER_COUNT = 1;
const { QUERYBUILDER_API_KEY, QUERYBUILDER_PASSWORD } = process.env;
console.log(QUERYBUILDER_API_KEY, QUERYBUILDER_PASSWORD);
const shopify = new Shopify({
  shopName: `${STORE_NAME}.myshopify.com`,
  apiKey: QUERYBUILDER_API_KEY,
  password: QUERYBUILDER_PASSWORD,
  apiVersion: `2020-04`,
  autoLimit: { calls: 2, interval: 1000, bucketSize: 35 },
});

shopify.on("callLimits", (limits) =>
  limits.remaining < 10 ? console.log(limits) : null
);

shopify.webhook.list().then((res) => console.log(res));
