import { useState } from "react";
import Container from "../components/Container";
import PageNameSection from "../components/PageNameSection";

export default function Contact({ settings }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    body: "",
    company: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      setStatus({ type: "success", message: "Message sent. Thank you!" });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        body: "",
        company: "",
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container settings={settings}>
      <div className="mt-10">
        <PageNameSection title={"Want to connect?"} />
        <section className="grid lg:grid-cols-2 gap-6 mt-6">
          <form
            onSubmit={onSubmit}
            className="w-full p-8 shadow-xl bg-white border border-slate-100"
          >
            <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--color-ink)]">
              Send me a <br /> message
            </h1>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={onChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="First Name*"
                required
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Last Name*"
                required
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email*"
                required
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Phone"
              />
            </div>
            <div className="my-4">
              <textarea
                name="body"
                value={form.body}
                onChange={onChange}
                placeholder="Message*"
                required
                className="w-full h-32 bg-gray-100 text-gray-900 mt-2 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              />
            </div>
            {status.message && (
              <p
                className={`mb-3 ${
                  status.type === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--color-brand)] text-white shadow px-4 py-3 flex items-center justify-center whitespace-nowrap cursor-pointer hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="p-8 bg-[var(--color-brand)] shadow-xl text-white">
            <h1 className="font-display font-bold uppercase text-4xl my-4">
              {settings.personName}
            </h1>
            <p className="text-blue-100">{settings.tagline}</p>
            <div className="flex flex-col space-y-4 mt-10">
              <p>
                <span className="italic">Location: </span>
                <strong>{settings.contact.location}</strong>
              </p>
              <p>
                <span className="italic">Phone: </span>
                <a className="font-bold" href={`tel:${settings.contact.phone}`}>
                  {settings.contact.phoneDisplay}
                </a>
              </p>
              <p>
                <span className="italic">Email: </span>
                <a
                  className="font-bold"
                  href={`mailto:${settings.contact.email}`}
                >
                  {settings.contact.email}
                </a>
              </p>
              <p>
                <span className="italic">LinkedIn: </span>
                <a className="font-bold" href={settings.socials.linkedin}>
                  {settings.socials.linkedinHandle}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}

export async function getServerSideProps() {
  const { getSiteSettings } = await import("../lib/content");
  const settings = await getSiteSettings();
  return { props: { settings } };
}
