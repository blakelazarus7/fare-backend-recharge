export default async function handler(req, res) {
  console.log("Recharge API Key:", process.env.RECHARGE_API_KEY);

  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  const RECHARGE_API_KEY = process.env.RECHARGE_API_KEY;

  try {
    const customerResp = await fetch(
      `https://api.rechargeapps.com/customers?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_API_KEY,
          Accept: "application/json",
        },
      }
    );

    const customerData = await customerResp.json();
    console.log("Customer data response:", customerData);

    if (!customerData.customers || customerData.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = customerData.customers[0].id;

    const subscriptionsResp = await fetch(
      `https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`,
      {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_API_KEY,
          Accept: "application/json",
        },
      }
    );

    const subscriptionsData = await subscriptionsResp.json();
    console.log("Subscriptions data response:", subscriptionsData);

    return res.status(200).json({
      customerId,
      subscriptions: subscriptionsData.subscriptions || [],
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
