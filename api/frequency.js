export default function handler(req, res) {
  console.log("✅ Endpoint HIT!");
  return res.status(200).json({ success: true });
}
