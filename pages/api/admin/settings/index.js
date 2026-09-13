import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return res.status(200).json(settings);
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        siteName: body.siteName,
        personName: body.personName,
        tagline: body.tagline,
        headline: body.headline,
        heroSupporting: body.heroSupporting,
        aboutBio: body.aboutBio,
        locations: body.locations || [],
        tools: body.tools || [],
        phone: body.phone,
        phoneDisplay: body.phoneDisplay,
        email: body.email,
        location: body.location,
        linkedin: body.linkedin,
        linkedinHandle: body.linkedinHandle,
        github: body.github,
        facebook: body.facebook,
        resumePath: body.resumePath,
        ogImagePath: body.ogImagePath,
        canonicalUrl: body.canonicalUrl,
        gaId: body.gaId,
      },
      create: {
        id: 1,
        siteName: body.siteName || "AZURA Portfolio",
        personName: body.personName || "Ali Zahedah",
        tagline: body.tagline || "",
        headline: body.headline || "",
        heroSupporting: body.heroSupporting || "",
        aboutBio: body.aboutBio || "",
        locations: body.locations || [],
        tools: body.tools || [],
        phone: body.phone || "",
        phoneDisplay: body.phoneDisplay || "",
        email: body.email || "",
        location: body.location || "",
        linkedin: body.linkedin || "",
        linkedinHandle: body.linkedinHandle || "",
        github: body.github || "",
        facebook: body.facebook || "",
        resumePath: body.resumePath || "/documents/Ali_Zahedah_Resume.pdf",
        ogImagePath: body.ogImagePath || "/avatar.png",
        canonicalUrl: body.canonicalUrl || "http://localhost:3000",
        gaId: body.gaId || "",
      },
    });
    return res.status(200).json(settings);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
