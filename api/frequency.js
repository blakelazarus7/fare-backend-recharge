export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ API Key (ensure it has correct scopes in Recharge dashboard)
  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";

  // ✅ Input validation
  const customerEmail = req.query.email;
  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // ✅ Fetch Customer by Email
    const customerResp = await fetch(
      `https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`,
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

    // ✅ Fetch Subscriptions for Customer
    const subResp = await fetch(
      `https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`,
      {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const subData = await subResp.json();

    if (!subData.subscriptions || subData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const subscription = subData.subscriptions[0];

    // ✅ Respond with plan info
    return res.status(200).json({
      plan: subscription.order_interval_unit
        ? `${subscription.order_interval_frequency} ${subscription.order_interval_unit}`
        : null,
      product_title: subscription.product_title || null,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
      details: err.message,
    });
  }
}
