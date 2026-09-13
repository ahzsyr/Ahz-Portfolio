import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminMessages({ messages: initial, settings }) {
  const [messages, setMessages] = useState(initial);

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
    refresh();
  };

  const remove = async (id) => {
    if (!confirm("Delete message?")) return;
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">Messages</h1>
      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-500">No messages yet.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white border rounded-lg p-4 ${
              msg.read ? "opacity-80" : "border-blue-300"
            }`}
          >
            <div className="flex justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold">
                  {msg.firstName} {msg.lastName}{" "}
                  {!msg.read && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded ml-2">
                      unread
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500">
                  {msg.email}
                  {msg.phone ? ` · ${msg.phone}` : ""} ·{" "}
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{msg.body}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => markRead(msg.id, !msg.read)}
                >
                  Mark {msg.read ? "unread" : "read"}
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => remove(msg.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
