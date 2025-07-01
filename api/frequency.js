export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RECHARGE_API_KEY = "sk_1x1_0bc7238081fd2551589cd28681857647706b8567150b3936df8dcfa59f5d9fb6";
  const shopifyCustomerId = "201072424"; // hardcoded Shopify ID for now

  try {
    // 1. Get customer by Shopify ID
    const customerResp = await fetch(
      `https://api.rechargeapps.com/api/v1/customers?shopify_customer_id=${shopifyCustomerId}`,
      {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const customerData = await customerResp.json();

    if (!customerData.customers || customerData.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = customerData.customers[0].id;

    // 2. Get subscriptions for that customer
    const subsResp = await fetch(
      `https://api.rechargeapps.com/api/v1/subscriptions?customer_id=${customerId}`,
      {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const subData = await subsResp.json();

    if (!subData.subscriptions || subData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const sub = subData.subscriptions[0];

    return res.status(200).json({
      plan: `${sub.order_interval_frequency} ${sub.order_interval_unit}`,
      product_title: sub.product_title,
      next_charge_scheduled_at: sub.next_charge_scheduled_at
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
