import { useState } from "react";
import { CheckCircle2, MapPin, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

const inputCls = "w-full h-11 px-3 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors";

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Name, email and message are required"); return; }
    setSending(true);
    try {
      await api.post("/contact", form);
      setDone(true);
    } catch {
      toast.error("Could not send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-14" data-testid="contact-page">
      <div className="grid lg:grid-cols-2 gap-14">
        <div>
          <p className="overline mb-3">Get in touch</p>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-light leading-[1.05]">Let's talk <span className="text-[#C5A880]">cars.</span></h1>
          <p className="text-[#888] mt-5 leading-relaxed max-w-md">Questions about a listing, a trade-in, or anything else? Send us a message and we'll get right back to you.</p>
          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4"><span className="grid place-items-center w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#C5A880]"><MapPin size={18} /></span><span className="text-[#ccc]">Dublin, Ireland</span></div>
            <div className="flex items-center gap-4"><span className="grid place-items-center w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#C5A880]"><Phone size={18} /></span><a href="tel:+35312345678" className="text-[#ccc] hover:text-[#C5A880] transition-colors">+353 1 234 5678</a></div>
            <div className="flex items-center gap-4"><span className="grid place-items-center w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#C5A880]"><Mail size={18} /></span><a href="mailto:sales@hamoudecartrade.ie" className="text-[#ccc] hover:text-[#C5A880] transition-colors">sales@hamoudecartrade.ie</a></div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-7">
          {done ? (
            <div className="text-center py-16" data-testid="contact-success">
              <CheckCircle2 size={52} className="text-[#34C759] mx-auto mb-5" />
              <h2 className="font-heading text-2xl font-light">Message sent</h2>
              <p className="text-[#888] mt-3">We'll be in touch shortly.</p>
              <button onClick={() => { setForm(empty); setDone(false); }} className="mt-7 px-6 py-2.5 rounded-sm border border-white/20 font-semibold hover:bg-white/5 transition-colors">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="overline block mb-2 text-[#888]">Name *</label><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="contact-name" /></div>
                <div><label className="overline block mb-2 text-[#888]">Email *</label><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="contact-email" /></div>
                <div><label className="overline block mb-2 text-[#888]">Phone</label><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="contact-phone" /></div>
                <div><label className="overline block mb-2 text-[#888]">Subject</label><input className={inputCls} value={form.subject} onChange={(e) => set("subject", e.target.value)} data-testid="contact-subject" /></div>
              </div>
              <div>
                <label className="overline block mb-2 text-[#888]">Message *</label>
                <textarea rows={5} className="w-full px-3 py-2.5 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
                  value={form.message} onChange={(e) => set("message", e.target.value)} data-testid="contact-message" />
              </div>
              <button type="submit" disabled={sending} data-testid="contact-submit"
                className="flex items-center gap-2 px-7 py-3.5 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors disabled:opacity-60">
                {sending ? "Sending…" : "Send message"} <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
