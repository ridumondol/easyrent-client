"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import PublicPageFrame from "@/components/PublicPageFrame";
import { apiRequest, getErrorMessage } from "@/lib/api";

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    try {
      await apiRequest("/contact", {
        method: "POST",
        body: {
          name: fields.get("name"),
          email: fields.get("email"),
          subject: fields.get("subject"),
          message: fields.get("message"),
        },
      });
      form.reset();
      toast.success("Thanks for reaching out. Your message has been received.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <PublicPageFrame>
      <section className="section-wrap grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ed7049]">We’re here to help</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#17271f] sm:text-5xl">Let’s talk equipment.</h1><p className="mt-5 text-base leading-7 text-[#68756d]">Questions about a listing, a rental, or getting your own equipment on Rentora? Send us a note and our team will follow up.</p><div className="mt-8 rounded-2xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#879188]">A quick note</p><p className="mt-2 text-sm leading-6 text-[#77827a]">Please don’t include payment card details or passwords in your message.</p></div></div>
        <form className="space-y-4 rounded-3xl border border-[#e8ebe7] bg-white p-6 shadow-sm sm:p-8" onSubmit={submitMessage}>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#34483b]">Your name<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]" maxLength={100} minLength={2} name="name" required /></label><label className="text-xs font-semibold text-[#34483b]">Email address<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]" maxLength={254} name="email" required type="email" /></label></div>
          <label className="block text-xs font-semibold text-[#34483b]">Subject<input className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]" maxLength={120} minLength={3} name="subject" required /></label>
          <label className="block text-xs font-semibold text-[#34483b]">Message<textarea className="mt-1.5 min-h-40 w-full resize-y rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]" maxLength={3000} minLength={10} name="message" required /></label>
          <button className="w-full rounded-full bg-[#14251e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#263b31] disabled:opacity-50 sm:w-auto" disabled={sending} type="submit">{sending ? "Sending…" : "Send message"}</button>
        </form>
      </section>
    </PublicPageFrame>
  );
}
