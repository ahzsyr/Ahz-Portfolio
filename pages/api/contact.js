import { prisma } from "../../lib/prisma";

const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 8;
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  hits.set(ip, entry);
  return entry.count > max;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  const { firstName, lastName, email, phone, body, company } = req.body || {};

  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!firstName || !lastName || !email || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await prisma.message.create({
      data: {
        firstName: String(firstName).slice(0, 100),
        lastName: String(lastName).slice(0, 100),
        email: String(email).slice(0, 160),
        phone: phone ? String(phone).slice(0, 50) : null,
        body: String(body).slice(0, 5000),
      },
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to save message" });
  }
}
