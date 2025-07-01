export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RECHARGE_API_KEY = "sk_..."; // Replace with your actual Recharge key
  const customerEmail = req.query.email;

  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const response = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`, {
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

    const subscriptionsResponse = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
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
