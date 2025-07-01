export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // DEBUG LOGS
  console.log("Received request");
  console.log("Email param:", req.query.email);
  console.log("Recharge API Key:", process.env.RECHARGE_API_KEY ? "✅ Exists" : "❌ MISSING");

  const RECHARGE_API_KEY = process.env.RECHARGE_API_KEY;
  const customerEmail = req.query.email;

  if (!customerEmail) {
    console.log("❌ Missing email param");
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // Lookup customer by email
    const customerResp = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const customerJson = await customerResp.json();
    console.log("Customer API Response:", customerJson);

    if (!customerJson.customers || customerJson.customers.length === 0) {
      console.log("❌ Customer not found");
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = customerJson.customers[0].id;
    console.log("✅ Found customer ID:", customerId);

    // Get subscriptions for the customer
    const subResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subJson = await subResp.json();
    console.log("Subscription API Response:", subJson);

    if (!subJson.subscriptions || subJson.subscriptions.length === 0) {
      console.log("❌ No subscriptions found");
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const sub = subJson.subscriptions[0];
    console.log("✅ Subscription found:", sub);

    return res.status(200).json({
      plan: sub.order_interval_unit ? `${sub.order_interval_frequency} ${sub.order_interval_unit}` : null,
      product_title: sub.product_title || null
    });

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
