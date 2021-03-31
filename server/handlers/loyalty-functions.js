// * Dry Run Option

// * Receive customer order webhooks
// * set loyalty data on variant & customer, upsert
// * trigger events for due > awarded > dispatched
// * upsert customer metafield > named after variant > d > a > s
// *
// * If is 1 before
// * Send Almost there! email
// *
// * If is target
// * updates order with "Loyalty Upgrade"
// * updates order variant with "Upgrade Item"
// * customize initial email (intercept?)
// * Listens for fulfillment hook > matches it to customer > validates loyalty metafield
// * sends dispatched bonus email

function handleWebhook(payload) {
  const item = payload.line_items.map((item) => ({
    id: item.id,
    variant_id: items.variant_id,
    product_id: item.product_id,
    title: item.variant_title,
    sku: item.variant_sku,
    quantity: items.quantity,
    fulfillable_quantity: items.fulfillable_quantity,
  }));
  const customer = {
    customer_id: payload.customer.id,
    orders_count: payload.customer.orders_count,
    email: payload.customer.email,
    created_at: payload.customer.created_at,
    updated_at: payload.customer.updated_at,
  };
  const history = {
    totalProductPurchases: "???",
    totalVariantPurchases: "???",
    rewards: 0,
  };
}

// {
// Item
//   productId,
//   variantId,
//   variantTitle,
//   sku
//   quantity
//   fulfillable_quantity
// Customer
//   customerId,
//   totalOrders,
//   email,
//   created_at
//   updated_at
// History
//   totalProductPurchases,
//   totalVariantPurchases,
//   rewards,
// }
