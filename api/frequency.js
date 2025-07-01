export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RECHARGE_API_KEY = "sk_1x1_0bc7238081fd2551589cd28681857647706b8567150b3936df8dcfa59f5d9fb6"; // your valid key

  const shopifyCustomerId = "201072424"; // hardcoded for now — this works 100%

  try {
    // Step 1: Get Recharge customer by Shopify ID
    const response = await fetch(`https://api.rechargeapps.com/api/v1/customers?shopify_customer_id=${shopifyCustomerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const json = await response.json();

    if (!json.customers || json.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = json.customers[0].id;

    // Step 2: Get their subscriptions
    const subscriptionsResponse = await fetch(`https://api.rechargeapps.com/api/v1/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subscriptions = await subscriptionsResponse.json();

    if (!subscriptions.subscriptions || subscriptions.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const sub = subscriptions.subscriptions[0];

    return res.status(200).json({
      plan: sub.order_interval_unit ? `${sub.order_interval_frequency} ${sub.order_interval_unit}` : null,
      product_title: sub.product_title || null,
    });

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
