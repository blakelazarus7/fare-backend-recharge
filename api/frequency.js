export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RECHARGE_API_KEY = process.env.RECHARGE_API_KEY;
  const customerEmail = req.query.email;

  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const customerResp = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`, {
      headers: {
        Authorization: `Bearer ${RECHARGE_API_KEY}`,
        Accept: "application/json"
      }
    });

    const customerData = await customerResp.json();

    if (!customerData.customers || customerData.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = customerData.customers[0].id;

    const subscriptionResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        Authorization: `Bearer ${RECHARGE_API_KEY}`,
        Accept: "application/json"
      }
    });

    const subData = await subscriptionResp.json();

    if (!subData.subscriptions || subData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const sub = subData.subscriptions[0];

    return res.status(200).json({
      plan: `${sub.order_interval_frequency} ${sub.order_interval_unit}`,
      product_title: sub.product_title
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
