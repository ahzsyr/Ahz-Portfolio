import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminSettings({ settings: initial }) {
  const [form, setForm] = useState({
    ...initial,
    locationsText: (initial.locations || []).join("\n"),
    toolsText: (initial.tools || []).join("\n"),
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      siteName: form.siteName,
      personName: form.personName,
      tagline: form.tagline,
      headline: form.headline,
      heroSupporting: form.heroSupporting,
      aboutBio: form.aboutBio,
      locations: form.locationsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      tools: form.toolsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      phone: form.contact?.phone || form.phone,
      phoneDisplay: form.contact?.phoneDisplay || form.phoneDisplay,
      email: form.contact?.email || form.email,
      location: form.contact?.location || form.location,
      linkedin: form.socials?.linkedin || form.linkedin,
      linkedinHandle: form.socials?.linkedinHandle || form.linkedinHandle,
      github: form.socials?.github || form.github,
      facebook: form.socials?.facebook || form.facebook,
      resumePath: form.resumePath,
      ogImagePath: form.ogImagePath,
      canonicalUrl: form.canonicalUrl,
      gaId: form.gaId,
    };

    // Flatten if coming from mapped settings
    if (form.contact) {
      payload.phone = form.phone || form.contact.phone;
      payload.phoneDisplay = form.phoneDisplay || form.contact.phoneDisplay;
      payload.email = form.email || form.contact.email;
      payload.location = form.location || form.contact.location;
    }
    if (form.socials) {
      payload.linkedin = form.linkedin || form.socials.linkedin;
      payload.linkedinHandle = form.linkedinHandle || form.socials.linkedinHandle;
      payload.github = form.github || form.socials.github;
      payload.facebook = form.facebook || form.socials.facebook;
    }

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.siteName,
        personName: form.personName,
        tagline: form.tagline,
        headline: form.headline,
        heroSupporting: form.heroSupporting,
        aboutBio: form.aboutBio,
        locations: form.locationsText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        tools: form.toolsText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        phone: form.phone,
        phoneDisplay: form.phoneDisplay,
        email: form.email,
        location: form.location,
        linkedin: form.linkedin,
        linkedinHandle: form.linkedinHandle,
        github: form.github,
        facebook: form.facebook,
        resumePath: form.resumePath,
        ogImagePath: form.ogImagePath,
        canonicalUrl: form.canonicalUrl,
        gaId: form.gaId,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Save failed");
      return;
    }
    setMessage("Settings saved. Public site will use the new site name immediately.");
  };

  return (
    <AdminLayout siteName={form.siteName}>
      <h1 className="text-3xl font-semibold mb-2">Settings</h1>
      <p className="text-slate-600 mb-6">
        Rename the product brand via <strong>Site name</strong> (e.g. AZURA Portfolio → ahz).
      </p>
      <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 space-y-4 max-w-3xl">
        {[
          ["siteName", "Site name (renamable brand)"],
          ["personName", "Person name"],
          ["tagline", "Tagline"],
          ["headline", "Hero headline"],
          ["phone", "Phone"],
          ["phoneDisplay", "Phone display"],
          ["email", "Email"],
          ["location", "Contact location"],
          ["linkedin", "LinkedIn URL"],
          ["linkedinHandle", "LinkedIn handle"],
          ["github", "GitHub URL"],
          ["facebook", "Facebook URL"],
          ["resumePath", "Resume path"],
          ["ogImagePath", "OG image path"],
          ["canonicalUrl", "Canonical URL"],
          ["gaId", "Google Analytics ID"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full border rounded px-3 py-2"
              name={name}
              value={form[name] || ""}
              onChange={onChange}
              required={name === "siteName"}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm mb-1">Hero supporting text</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            name="heroSupporting"
            value={form.heroSupporting || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">About bio</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[140px]"
            name="aboutBio"
            value={form.aboutBio || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Locations (one per line)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            name="locationsText"
            value={form.locationsText || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tools (one per line)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            name="toolsText"
            value={form.toolsText || ""}
            onChange={onChange}
          />
        </div>
        {message && <p className="text-green-700">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const settings = row
    ? {
        siteName: row.siteName,
        personName: row.personName,
        tagline: row.tagline,
        headline: row.headline,
        heroSupporting: row.heroSupporting,
        aboutBio: row.aboutBio,
        locations: row.locations,
        tools: row.tools,
        phone: row.phone,
        phoneDisplay: row.phoneDisplay,
        email: row.email,
        location: row.location,
        linkedin: row.linkedin,
        linkedinHandle: row.linkedinHandle,
        github: row.github,
        facebook: row.facebook,
        resumePath: row.resumePath,
        ogImagePath: row.ogImagePath,
        canonicalUrl: row.canonicalUrl,
        gaId: row.gaId,
      }
    : await getSiteSettings().then((s) => ({
        ...s,
        phone: s.contact.phone,
        phoneDisplay: s.contact.phoneDisplay,
        email: s.contact.email,
        location: s.contact.location,
        linkedin: s.socials.linkedin,
        linkedinHandle: s.socials.linkedinHandle,
        github: s.socials.github,
        facebook: s.socials.facebook,
      }));

  return {
    props: {
      settings: JSON.parse(JSON.stringify(settings)),
    },
  };
}
