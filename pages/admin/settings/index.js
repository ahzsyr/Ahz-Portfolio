import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import RichTextEditor from "../../../components/admin/RichTextEditor";
import MediaPickerModal from "../../../components/admin/MediaPickerModal";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";
import { sanitizeHtmlForStorage } from "../../../lib/sanitizeHtml";

const TABS = [
  { id: "brand", label: "Brand" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Social" },
  { id: "seo", label: "SEO" },
  { id: "content", label: "Content" },
];

export default function AdminSettings({ settings: initial }) {
  const [tab, setTab] = useState("brand");
  const [form, setForm] = useState({
    ...initial,
    locationsText: (initial.locations || []).join("\n"),
    toolsText: (initial.tools || []).join("\n"),
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePickResolve, setImagePickResolve] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const requestEditorImage = () =>
    new Promise((resolve) => {
      setImagePickResolve(() => resolve);
      setPickerOpen(true);
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.siteName,
        personName: form.personName,
        tagline: form.tagline,
        headline: form.headline,
        heroSupporting: sanitizeHtmlForStorage(form.heroSupporting),
        aboutBio: sanitizeHtmlForStorage(form.aboutBio),
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
    setMessage("Settings saved.");
  };

  const field = (name, label, required = false) => (
    <div key={name}>
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="w-full border rounded px-3 py-2"
        name={name}
        value={form[name] || ""}
        onChange={onChange}
        required={required}
      />
    </div>
  );

  return (
    <AdminLayout siteName={form.siteName}>
      <PageHeader
        title="Settings"
        description="Rename the brand via Site name. Content fields support rich text."
      />

      <div className="flex flex-col min-h-[calc(100%-5rem)]">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 mb-4 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
                tab === t.id
                  ? "border-blue-600 text-blue-700 font-medium"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form
          id="settings-form"
          onSubmit={onSubmit}
          className="flex-1 bg-white border rounded-lg p-5 space-y-4 max-w-3xl mb-20"
        >
          {tab === "brand" && (
            <>
              {field("siteName", "Site name (renamable brand)", true)}
              {field("personName", "Person name")}
              {field("tagline", "Tagline")}
              {field("headline", "Hero headline")}
              <div>
                <label className="block text-sm mb-1">
                  Locations (one per line)
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[80px]"
                  name="locationsText"
                  value={form.locationsText || ""}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Tools (one per line)
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[80px]"
                  name="toolsText"
                  value={form.toolsText || ""}
                  onChange={onChange}
                />
              </div>
            </>
          )}

          {tab === "contact" && (
            <>
              {field("phone", "Phone")}
              {field("phoneDisplay", "Phone display")}
              {field("email", "Email")}
              {field("location", "Contact location")}
              {field("resumePath", "Resume path")}
            </>
          )}

          {tab === "social" && (
            <>
              {field("linkedin", "LinkedIn URL")}
              {field("linkedinHandle", "LinkedIn handle")}
              {field("github", "GitHub URL")}
              {field("facebook", "Facebook URL")}
            </>
          )}

          {tab === "seo" && (
            <>
              {field("ogImagePath", "OG image path")}
              {field("canonicalUrl", "Canonical URL")}
              {field("gaId", "Google Analytics ID")}
            </>
          )}

          {tab === "content" && (
            <>
              <div>
                <label className="block text-sm mb-1">Hero supporting text</label>
                <RichTextEditor
                  value={form.heroSupporting || ""}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, heroSupporting: html }))
                  }
                  placeholder="Short supporting copy under the headline…"
                  onRequestImage={requestEditorImage}
                  minHeight="120px"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">About bio</label>
                <RichTextEditor
                  value={form.aboutBio || ""}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, aboutBio: html }))
                  }
                  placeholder="About page biography…"
                  onRequestImage={requestEditorImage}
                  minHeight="200px"
                />
              </div>
            </>
          )}

          {message && (
            <p
              className={
                message.includes("failed") ? "text-red-600" : "text-green-700"
              }
            >
              {message}
            </p>
          )}
        </form>

        <div className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-slate-100/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 truncate">
            Editing: {TABS.find((t) => t.id === tab)?.label}
          </p>
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => {
          if (imagePickResolve) {
            imagePickResolve(null);
            setImagePickResolve(null);
          }
          setPickerOpen(false);
        }}
        onSelect={(path) => {
          if (imagePickResolve) {
            imagePickResolve(path);
            setImagePickResolve(null);
          }
          setPickerOpen(false);
        }}
        title="Insert image"
      />
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
