declare module namespace {
  export interface ShopMoney {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney {
    amount: string;
    currency_code: string;
  }

  export interface TotalLineItemsPriceSet {
    shop_money: ShopMoney;
    presentment_money: PresentmentMoney;
  }

  export interface ShopMoney2 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney2 {
    amount: string;
    currency_code: string;
  }

  export interface TotalDiscountsSet {
    shop_money: ShopMoney2;
    presentment_money: PresentmentMoney2;
  }

  export interface ShopMoney3 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney3 {
    amount: string;
    currency_code: string;
  }

  export interface TotalShippingPriceSet {
    shop_money: ShopMoney3;
    presentment_money: PresentmentMoney3;
  }

  export interface ShopMoney4 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney4 {
    amount: string;
    currency_code: string;
  }

  export interface SubtotalPriceSet {
    shop_money: ShopMoney4;
    presentment_money: PresentmentMoney4;
  }

  export interface ShopMoney5 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney5 {
    amount: string;
    currency_code: string;
  }

  export interface TotalPriceSet {
    shop_money: ShopMoney5;
    presentment_money: PresentmentMoney5;
  }

  export interface ShopMoney6 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney6 {
    amount: string;
    currency_code: string;
  }

  export interface TotalTaxSet {
    shop_money: ShopMoney6;
    presentment_money: PresentmentMoney6;
  }

  export interface ShopMoney7 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney7 {
    amount: string;
    currency_code: string;
  }

  export interface PriceSet {
    shop_money: ShopMoney7;
    presentment_money: PresentmentMoney7;
  }

  export interface ShopMoney8 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney8 {
    amount: string;
    currency_code: string;
  }

  export interface TotalDiscountSet {
    shop_money: ShopMoney8;
    presentment_money: PresentmentMoney8;
  }

  export interface OriginLocation {
    id: number;
    country_code: string;
    province_code: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    zip: string;
  }

  export interface LineItem {
    id: number;
    variant_id: number;
    title: string;
    quantity: number;
    sku: string;
    variant_title: string;
    vendor: string;
    fulfillment_service: string;
    product_id: number;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    name: string;
    variant_inventory_management: string;
    properties: any[];
    product_exists: boolean;
    fulfillable_quantity: number;
    grams: number;
    price: string;
    total_discount: string;
    fulfillment_status?: any;
    price_set: PriceSet;
    total_discount_set: TotalDiscountSet;
    discount_allocations: any[];
    duties: any[];
    admin_graphql_api_id: string;
    tax_lines: any[];
    origin_location: OriginLocation;
  }

  export interface ShopMoney9 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney9 {
    amount: string;
    currency_code: string;
  }

  export interface PriceSet2 {
    shop_money: ShopMoney9;
    presentment_money: PresentmentMoney9;
  }

  export interface ShopMoney10 {
    amount: string;
    currency_code: string;
  }

  export interface PresentmentMoney10 {
    amount: string;
    currency_code: string;
  }

  export interface DiscountedPriceSet {
    shop_money: ShopMoney10;
    presentment_money: PresentmentMoney10;
  }

  export interface ShippingLine {
    id: number;
    title: string;
    price: string;
    code: string;
    source: string;
    phone?: any;
    requested_fulfillment_service_id?: any;
    delivery_category?: any;
    carrier_identifier?: any;
    discounted_price: string;
    price_set: PriceSet2;
    discounted_price_set: DiscountedPriceSet;
    discount_allocations: any[];
    tax_lines: any[];
  }

  export interface BillingAddress {
    first_name: string;
    address1: string;
    phone?: any;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company?: any;
    latitude?: any;
    longitude?: any;
    name: string;
    country_code: string;
    province_code: string;
  }

  export interface ShippingAddress {
    first_name: string;
    address1: string;
    phone?: any;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company?: any;
    latitude?: any;
    longitude?: any;
    name: string;
    country_code: string;
    province_code: string;
  }

  export interface ClientDetails {
    browser_ip: string;
    accept_language: string;
    user_agent: string;
    session_hash?: any;
    browser_width: number;
    browser_height: number;
  }

  export interface PaymentDetails {
    credit_card_bin: string;
    avs_result_code?: any;
    cvv_result_code?: any;
    credit_card_number: string;
    credit_card_company: string;
  }

  export interface DefaultAddress {
    id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    company?: any;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: any;
    name: string;
    province_code: string;
    country_code: string;
    country_name: string;
    default: boolean;
  }

  export interface Customer {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: Date;
    updated_at: Date;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id?: any;
    note?: any;
    verified_email: boolean;
    multipass_identifier?: any;
    tax_exempt: boolean;
    phone?: any;
    tags: string;
    last_order_name?: any;
    currency: string;
    accepts_marketing_updated_at: Date;
    marketing_opt_in_level?: any;
    admin_graphql_api_id: string;
    default_address: DefaultAddress;
  }

  export interface Payload {
    id: number;
    email: string;
    closed_at?: any;
    created_at: Date;
    updated_at: Date;
    number: number;
    note?: any;
    token: string;
    gateway: string;
    test: boolean;
    total_price: string;
    subtotal_price: string;
    total_weight: number;
    total_tax: string;
    taxes_included: boolean;
    currency: string;
    financial_status: string;
    confirmed: boolean;
    total_discounts: string;
    total_line_items_price: string;
    cart_token: string;
    buyer_accepts_marketing: boolean;
    name: string;
    referring_site: string;
    landing_site: string;
    cancelled_at?: any;
    cancel_reason?: any;
    total_price_usd: string;
    checkout_token: string;
    reference?: any;
    user_id?: any;
    location_id?: any;
    source_identifier?: any;
    source_url?: any;
    processed_at: Date;
    device_id?: any;
    phone?: any;
    customer_locale: string;
    app_id: number;
    browser_ip: string;
    landing_site_ref?: any;
    order_number: number;
    discount_applications: any[];
    discount_codes: any[];
    note_attributes: any[];
    payment_gateway_names: string[];
    processing_method: string;
    checkout_id: number;
    source_name: string;
    fulfillment_status?: any;
    tax_lines: any[];
    tags: string;
    contact_email: string;
    order_status_url: string;
    presentment_currency: string;
    total_line_items_price_set: TotalLineItemsPriceSet;
    total_discounts_set: TotalDiscountsSet;
    total_shipping_price_set: TotalShippingPriceSet;
    subtotal_price_set: SubtotalPriceSet;
    total_price_set: TotalPriceSet;
    total_tax_set: TotalTaxSet;
    line_items: LineItem[];
    fulfillments: any[];
    refunds: any[];
    total_tip_received: string;
    original_total_duties_set?: any;
    current_total_duties_set?: any;
    admin_graphql_api_id: string;
    shipping_lines: ShippingLine[];
    billing_address: BillingAddress;
    shipping_address: ShippingAddress;
    client_details: ClientDetails;
    payment_details: PaymentDetails;
    customer: Customer;
  }

  export interface ShopifyWebhookOrderCreateRoot {
    topic: string;
    domain: string;
    payload: Payload;
  }
}
