import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

function preview(text, max = 100) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function AdminMessages({ messages: initial, settings }) {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
  };

  const markRead = async (id, read) => {
    await fetch("/api/admin/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    await refresh();
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, read } : prev
    );
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      await markRead(msg.id, true);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleting(false);
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Messages"
        description="Contact form inbox — open a row to read the full message."
      />
      <div className="bg-white border rounded-lg overflow-hidden">
        {messages.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-sm">No messages yet.</p>
        )}
        {messages.map((msg) => (
          <button
            key={msg.id}
            type="button"
            onClick={() => openMessage(msg)}
            className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 flex items-start justify-between gap-3 ${
              msg.read ? "" : "bg-blue-50/60"
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium truncate">
                {msg.firstName} {msg.lastName}
                {!msg.read && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded ml-2">
                    unread
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {msg.email}
                {msg.phone ? ` · ${msg.phone}` : ""} ·{" "}
                {new Date(msg.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 mt-1">{preview(msg.body)}</p>
            </div>
            <span className="text-blue-600 text-sm shrink-0">View</span>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `${selected.firstName} ${selected.lastName}`
            : "Message"
        }
        size="lg"
        footer={
          selected && (
            <div className="flex justify-between gap-2 flex-wrap">
              <button
                type="button"
                className="text-red-600 px-3 py-2"
                onClick={() => setDeleteId(selected.id)}
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100"
                  onClick={() => markRead(selected.id, !selected.read)}
                >
                  Mark {selected.read ? "unread" : "read"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              <a
                className="text-blue-600"
                href={`mailto:${selected.email}`}
              >
                {selected.email}
              </a>
              {selected.phone ? ` · ${selected.phone}` : ""} ·{" "}
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap text-slate-800">{selected.body}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete message"
        message="Delete this message?"
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [messages, settings] = await Promise.all([
    prisma.message.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteSettings(),
  ]);
  return {
    props: {
      messages: JSON.parse(JSON.stringify(messages)),
      settings,
    },
  };
}
