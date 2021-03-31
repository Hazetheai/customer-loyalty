const dotenv = require("dotenv");
const Shopify = require("shopify-api-node");
const axios = require("axios");
var valvelet = require("valvelet");
const readline = require("readline");
const fs = require("fs");
dotenv.config({ path: "../../.env" });

// const currentProductMF = require("./generated/product-metafields.json");
// const currentVariantMF = require("./generated/variant-metafields.json");
// const currentCustomerOrderData = require("./generated/order-data.json");

const STORE_NAME = "stefar";
const MIN_ORDER_COUNT = 1;
const { QUERYBUILDER_API_KEY, QUERYBUILDER_PASSWORD } = process.env;

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

// Limit shopify requests to 2 per second as their native way doesn't seem to work
shopify.request = valvelet(shopify.request, 2, 1000);

// These are the params to be set on the Products & Variants
// Each value is intended to be Read & Write
async function createParamMetafields() {
  try {
    const allProducts = await shopify.product.list();
    // /admin/products/#{id}/metafields.json
    const loyaltyProductMetafields = allProducts.map((prod, idx) => {
      return {
        id: prod.id,
        metafield: {
          namespace: "bbff_loyalty",
          key: "params",
          value: {
            active: true,
            orderThreshold: 3,
            reward: "next_variant_value",
            pollinatorPointsValue: prod.variants[0].price * 100,
          },
          value_type: "json_string",
        },
      };
    });
    // /admin/products/#{id}/variants/#{id}/metafields.json
    const loyaltyVariantMetafields = allProducts.map((prod, idx) => {
      return {
        product: prod.id,
        variants: prod.variants.map((variant, idx) => {
          return {
            id: variant.id,
            metafield: {
              namespace: "bbff_loyalty",
              key: "params",
              value: {
                active: true,
                orderThreshold: 3,
                reward: "next_variant_value",
                pollinatorPointsValue: variant.price * 100,
              },
              value_type: "json_string",
            },
          };
        }),
      };
    });

    fs.writeFile(
      "./generated/product-metafields.json",
      JSON.stringify(loyaltyProductMetafields),
      (err) => console.log(err)
    );
    fs.writeFile(
      "./generated/variant-metafields.json",
      JSON.stringify(loyaltyVariantMetafields),
      (err) => console.log(err)
    );

    return {
      products: loyaltyProductMetafields,
      variants: loyaltyVariantMetafields,
    };
    // console.log(allProducts.length);
  } catch (error) {
    console.log(`error in createParamMetafields`, error);
  }
}

// Receive Product metafields from createParamMetafields and add them to each product
async function addProductMetafields(metafields) {
  try {
    metafields.map((product) => {
      shopify.metafield
        .create({
          key: product.metafield.key,
          value: JSON.stringify(product.metafield.value),
          value_type: "json_string",
          namespace: "bbff_loyalty",
          owner_resource: "product",
          owner_id: product.id,
        })
        .then(
          (metafield) => console.log(metafield),
          (err) => console.error(err)
        );
    });
  } catch (error) {
    console.log(`Error in addProductMetafields`, error);
  }
}
// Receive Variant metafields from createParamMetafields and add them to each product
async function addVariantMetafields(metafields) {
  try {
    metafields.map((product) => {
      product.variants.map((variant) => {
        //   console.log(`variant`, variant);
        shopify.metafield
          .create({
            key: variant.metafield.key,
            value: JSON.stringify(variant.metafield.value),
            value_type: "json_string",
            namespace: "bbff_loyalty",
            owner_resource: "variant",
            owner_id: variant.id,
          })
          .then(
            (metafield) => console.log(metafield),
            (err) => console.error(err)
          );
      });
    });
  } catch (error) {
    console.log(`Error in addVariantMetafields`, error);
  }
}

async function deleteProductMetafields(metafields) {
  try {
    metafields.map((prod) =>
      shopify.metafield
        .list({ metafield: { owner_resource: "product", owner_id: prod.id } })
        .then((mf) => {
          mf.filter((m) => m.namespace === "bbff_loyalty").map((m) =>
            shopify.metafield.delete(m.id)
          );
        })
        .catch((err) => console.error(err))
    );
  } catch (error) {
    console.log(`Error in deleteProductMetafields`, error);
  }
}

async function getProductMetafields(id) {
  shopify.metafield
    .list({ metafield: { owner_resource: "product", owner_id: id } })
    .then((metafield) => console.log(metafield))
    .catch((err) => console.error(err));
}

async function getCustomers() {
  shopify.customer
    .search({ query: `orders_count:>=${MIN_ORDER_COUNT}` })
    .then((customer) => console.log(customer))
    .catch((err) => console.error(err));
}

// GET the first 100 order IDs from a Customer
const customerOrderIDsQuery = (id) => `
{
    customer(id: "gid://shopify/Customer/${id}") {
        id
        ordersCount
        firstName
        orders(first: 100) {
          edges {
            node {
              id
            }
          }
        }
    }
}
`;

// GET the customer, lineitem, product & variant IDS from an order
const customerOrderItemsQuery = (orderId) => `
{
    order(id: "${orderId}") {
      id
      name
      subtotalPriceSet{
        presentmentMoney{
          amount
        }
      }
      customer {
        id
        ordersCount
        firstName
      }
      lineItems(first: 7) {
        edges {
          node {
            id
            name
            title
            variant{
              id
              title
              price
            }
            product {
              id
            }
          }
        }
      }
    }
  }
`;

async function getEligibleCustomersOrderData() {
  // Get all Eligible customers
  try {
    const elegibleCustomers = await shopify.customer.search({
      query: `orders_count:>=${MIN_ORDER_COUNT}`,
    });
    // Retrieve the Order IDs
    const elegibleCustOrders = await Promise.all(
      elegibleCustomers.map(
        async (customer) =>
          await shopify.graphql(customerOrderIDsQuery(customer.id))
      )
    );
    // Use the previous data to get all the Order Items
    const elegibleCustOrderItems = await Promise.all(
      elegibleCustOrders.map(async (customer) => {
        const customerOrders = await Promise.all(
          customer.customer.orders.edges.map(async (order) => {
            const customerOrderWithItems = await shopify.graphql(
              customerOrderItemsQuery(order.node.id)
            );
            return customerOrderWithItems;
          })
        );

        return {
          customer: customer.customer.id,
          orderData: customerOrders.map((order) => order.order),
        };
      })
    );

    return elegibleCustOrderItems;
  } catch (error) {
    console.log(`Error in getEligibleCustomersOrderData`, error);
    return [];
  }
}

function formatCustomerOrderData(currentCustomerOrderData) {
  const formattedData = currentCustomerOrderData.map((customer) => {
    const allProducts = customer.orderData.reduce(
      (allOrders, order) =>
        allOrders.concat(order.lineItems.edges.map((el) => el.node.product.id)),
      []
    );
    const allVariants = customer.orderData.reduce(
      (allOrders, order) =>
        allOrders.concat(order.lineItems.edges.map((el) => el.node.variant.id)),
      []
    );
    const totalProductNumbers = allProducts.reduce((productList, currProd) => {
      productList[currProd]
        ? (productList[currProd] += 1)
        : (productList[currProd] = 1);

      return productList;
    }, {});
    const totalVariantNumbers = allVariants.reduce(
      (variantList, currVariant) => {
        variantList[currVariant]
          ? (variantList[currVariant] += 1)
          : (variantList[currVariant] = 1);

        return variantList;
      },
      {}
    );

    const customerStats = {
      id: customer.customer,
      name: customer.orderData[0].customer.firstName,
      orderCount: customer.orderData.length,
      awardedBonuses: 0,
      dispatchedBonus: 0,
      orderValue: customer.orderData.reduce(
        (acc, val) =>
          (acc += Number(val.subtotalPriceSet.presentmentMoney.amount)),
        0
      ),
      mailchimp_id: "",
      pollinatorPoints:
        customer.orderData.reduce(
          (acc, val) =>
            (acc += Number(val.subtotalPriceSet.presentmentMoney.amount)),
          0
        ) * 100,
      products: totalProductNumbers
        ? Object.entries(totalProductNumbers).map((entry) => ({
            id: entry[0],
            orderCount: entry[1],
            orderThreshold: MIN_ORDER_COUNT,
          }))
        : null,
      variants: totalProductNumbers
        ? Object.entries(totalVariantNumbers).map((entry) => ({
            id: entry[0],
            orderCount: entry[1],
            orderThreshold: MIN_ORDER_COUNT,
          }))
        : null,
    };

    return customerStats;
  });
  fs.writeFile(
    "./generated/customer-data.json",
    JSON.stringify(formattedData),
    (err) => console.log(err)
  );
  return formattedData;
}

// Retreive products & variants from all orders
async function processBulkOrderLineByLine() {
  // TODO filename to param
  const fileStream = fs.createReadStream("./generated/all-orders.jsonl");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  // List of all the orders each product has appeared on. Indexed by product id with data: {count, orderId, variantId}
  const productList = {};
  const variantList = {};

  try {
    for await (const line of rl) {
      // Verify data is available in current line
      const currentLine = JSON.parse(line);

      const currentProductId = currentLine.product
        ? currentLine.product.id
        : null;
      const currentVariant = currentProductId ? currentLine.variant.id : null;
      const currentOrder = currentProductId ? currentLine.__parentId : null;

      //   Add product data - count, orders, & variants
      if (currentProductId) {
        productList[currentProductId] =
          typeof productList[currentProductId] === "object"
            ? {
                ...productList[currentProductId],
                count: productList[currentProductId].count + 1,
              }
            : { count: 1, orderIds: new Set(), variantIds: new Set() };

        if (currentOrder) {
          productList[currentProductId].orderIds
            ? productList[currentProductId].orderIds.add(currentOrder)
            : null;
        }
        if (currentVariant) {
          productList[currentProductId].variantIds.add(currentVariant);
        }
      }

      //   Set the variant in the list if not present else update the count
      if (currentVariant) {
        variantList[currentVariant] =
          typeof variantList[currentVariant] === "object"
            ? {
                ...variantList[currentVariant],
                count: variantList[currentVariant].count + 1,
              }
            : { count: 1, orderIds: new Set(), variantIds: new Set() };
        // console.log(`currentOrder`, currentOrder);
        // console.log(`variantList[currentVariant]`, variantList[currentVariant]);
        // Add the current order ID
        if (currentOrder) {
          //   variantList[currentVariant].orderIds
          variantList[currentVariant].orderIds.add(currentOrder);
          // : null;
        }
        if (currentVariant) {
          variantList[currentVariant].variantIds.add(currentVariant);
        }
      }

      // Each line in input.txt will be successively available here as `line`.
      // console.log(`Line from file: ${JSON.stringify(JSON.parse(line), null, 2)}`);
    }
    // console.log(JSON.stringify(productList, null, 2));
    // console.log("variantList >>>", JSON.stringify(variantList, null, 2));
    return { productList, variantList };
  } catch (error) {
    console.log(`Error in processBulkOrderLineByLine`, error);
    return { productList, variantList };
  }
}

async function formatProductData() {
  try {
    //   product data - count, orders, & variants
    //   variant data - count, orders, & variantId
    const {
      productList: productOrderList,
      variantList: variantOrderList,
    } = await processBulkOrderLineByLine();

    // All currently active products
    const allProducts = await shopify.product.list({
      status: "active",
      //   limit: 2,
    });
    // All the order data from eligible customers (Over the MIN_ORDER_COUNT)
    const orderData = await getEligibleCustomersOrderData();
    // Elegible Customers Formated for processing
    const customerOrderData = formatCustomerOrderData(orderData);

    // Create array of all products
    const formattedData = await Promise.all(
      allProducts.map(async (product) => {
        // Confirm the customer has ordered the current product
        const customersWithProduct = customerOrderData.filter((customer) =>
          customer.products.find((el) => product.admin_graphql_api_id === el.id)
        );

        // How many times the current product been ordered in total
        const totalOrderCount = productOrderList[product.admin_graphql_api_id]
          ? productOrderList[product.admin_graphql_api_id].count
          : 0;

        //   Each customer who has ordered the current product & how many times
        const elegibleCustomers = customersWithProduct.map((cus) => {
          const match = cus.products.find(
            (el) => el.id === product.admin_graphql_api_id
          );
          return {
            id: cus.id,
            orderCount: match ? match.orderCount : 0,
            name: cus.name,
          };
        });
        // All the orders this product has appeared on
        const orders = productOrderList[product.admin_graphql_api_id]
          ? [...productOrderList[product.admin_graphql_api_id].orderIds]
          : [];
        // All the variants this product has been ordered as
        const variants = productOrderList[product.admin_graphql_api_id]
          ? [...productOrderList[product.admin_graphql_api_id].variantIds]
          : [];

        //   A breakdown of each variant
        const variantData = await formatVariantData({
          productId: product.id,
          variantOrderList,
          orderData,
          customerOrderData,
        });
        return {
          id: product.admin_graphql_api_id,
          title: product.title,
          totalOrderCount,
          timesGrantedBonusCount: 0,
          elegibleCustomers,
          orders,
          variants,
          variantData,
        };
      })
    );

    fs.writeFile(
      "./generated/product-stats.json",
      JSON.stringify(formattedData),
      (err) => console.log(err)
    );

    return formattedData;
  } catch (error) {
    console.log(`Error in formatProductData`, error);
  }
}

async function formatVariantData({
  productId,
  variantOrderList,
  orderData,
  customerOrderData,
}) {
  try {
    // All of a products variants
    const productVariants = await shopify.productVariant.list(productId);

    const formattedData = productVariants.map((variant) => {
      // All elegible customers that have ordered this variant
      const customersWithVariant = customerOrderData.filter((customer) =>
        customer.variants.find(
          (el) => `gid://shopify/ProductVariant/${variant.id}` === el.id
        )
      );

      // The total times this variant has been ordered
      const totalOrderCount = variantOrderList[
        `gid://shopify/ProductVariant/${variant.id}`
      ]
        ? variantOrderList[`gid://shopify/ProductVariant/${variant.id}`].count
        : 0;

      //   Each customer who has ordered the current variant & how many times
      const elegibleCustomers = customersWithVariant.map((cus) => {
        const match = cus.variants.find(
          (el) => el.id === `gid://shopify/ProductVariant/${variant.id}`
        );
        return {
          id: cus.id,
          orderCount: match ? match.orderCount : 0,
          name: cus.name,
        };
      });

      // All the orders this variant has appeared on
      const orders = variantOrderList[
        `gid://shopify/ProductVariant/${variant.id}`
      ]
        ? [
            ...variantOrderList[`gid://shopify/ProductVariant/${variant.id}`]
              .orderIds,
          ]
        : [];

      return {
        id: `gid://shopify/ProductVariant/${variant.id}`,
        title: variant.title,
        totalOrderCount,
        timesGrantedBonusCount: 0,
        timesAsBonusCount: 0,
        elegibleCustomers,
        orders,
      };
    });

    fs.writeFile(
      `./generated/variant-stats/variant-stats-${productId}.json`,
      JSON.stringify(formattedData),
      (err) => console.log(err)
    );

    return formattedData;
  } catch (error) {
    console.log(`Error in formatVariantData`, error);
  }
}

(async function () {
  try {
    // const metafields = await createParamMetafields();
    // await addProductMetafields(metafields.products);
    // await addVariantMetafields(metafields.variants);

    // Delete Metafields
    // deleteProductMetafields(metafields.products);

    // Customers
    // await getCustomers();
    // await getEligibleCustomersOrderData();
    // await testQuery();

    // console.log(`customerData`, JSON.stringify(customerData, null, 2));
    // const productList = await processBulkOrderLineByLine();
    // const variantStats = await formatVariantData();
    // console.log(`variantStats`, JSON.stringify(variantStats, null, 2));
    const productStats = await formatProductData();
    // console.log(`productStats`, JSON.stringify(productStats, null, 2));
    console.log("Ran Main Func");
  } catch (error) {
    console.log("Error in main Func", error);
  }
})();
