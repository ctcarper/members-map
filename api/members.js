export default async function handler(req, res) {
  // CORS headers to allow Squarespace to fetch from this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get org ID from query params, with fallback to default
    const org = req.query.org || "34035";

    // Validate org ID (numbers only, prevent injection)
    if (!/^\d+$/.test(org)) {
      return res.status(400).json({ error: "Invalid org ID format" });
    }

    // Set timeout for the fetch (10 seconds max)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Fetch MembershipWorks directory
    const mwRes = await fetch(
      `https://membershipworks.com/api/directory/list?org=${org}&format=json`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    // Handle different HTTP responses
    if (!mwRes.ok) {
      const statusCode = mwRes.status;
      if (statusCode === 401) {
        return res.status(401).json({ error: "MembershipWorks API auth failed" });
      }
      if (statusCode === 429) {
        return res.status(429).json({ error: "Rate limited by MembershipWorks API" });
      }
      if (statusCode === 404) {
        return res.status(404).json({ error: "Organization not found" });
      }
      return res.status(502).json({ error: `MembershipWorks API error: ${statusCode}` });
    }

    // Parse response
    const data = await mwRes.json();

    // Validate response structure
    if (!data || typeof data !== "object") {
      return res.status(502).json({ error: "Invalid response from MembershipWorks API" });
    }

    // Return data + Mapbox token from environment variables
    return res.status(200).json({
      ...data,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || ""
    });

  } catch (err) {
    // Handle timeout
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Request timeout - MembershipWorks API took too long" });
    }

    // Handle network errors
    console.error("API error:", err);
    return res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === "development" ? err.message : undefined 
    });
  }
}
