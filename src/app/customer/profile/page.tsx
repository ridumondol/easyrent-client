"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { PageIntro } from "@/components/dashboard/DashboardUI";
import ProfileImageUploader from "@/components/profile/ProfileImageUploader";
import { apiRequest, formatDate, getErrorMessage, type User } from "@/lib/api";

type ProfileResponse = { user: User };

export default function CustomerProfilePage() {
  const { user, token, reloadUser } = useAuth();

  return (
    <>
      <PageIntro
        eyebrow="Account & Profile"
        title="Personal Profile"
        description="Manage your account profile, contact information, and delivery address for equipment rentals."
      />

      <div key={user?._id || "customer"} className="grid gap-6 lg:grid-cols-3 max-w-5xl">
        {/* Left Column: Avatar & Account Summary Card */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-5">
              Profile Photo
            </h3>
            <div className="flex flex-col items-center text-center">
              <ProfileImageUploader size="xl" showDetails={false} />
              <p className="mt-4 text-sm font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60 capitalize">
                  <ShieldCheck size={12} /> {user?.role || "Customer"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 capitalize">
                  <Sparkles size={11} /> {user?.authProvider || "email"} Auth
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-4 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Account status</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Member since</span>
                <span className="font-medium text-neutral-800">
                  {user?.createdAt ? formatDate(user.createdAt) : "—"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Profile Details Form */}
        <CustomerProfileForm user={user} token={token} reloadUser={reloadUser} />
      </div>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </>
  );
}

function CustomerProfileForm({
  user,
  token,
  reloadUser,
}: {
  user: User | null;
  token: string | null;
  reloadUser: () => Promise<void>;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const result = await apiRequest<ProfileResponse>("/auth/me", {
        method: "PATCH",
        token,
        body: {
          name,
          email,
          phone: phone || undefined,
          address: address || undefined,
        },
      });
      setName(result.user.name);
      setEmail(result.user.email);
      setPhone(result.user.phone ?? "");
      setAddress(result.user.address ?? "");
      await reloadUser();
      setSaved(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="lg:col-span-2 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
      <div className="border-b border-neutral-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-neutral-900">Personal Details</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Keep your contact information accurate so equipment owners can reach you.
        </p>
      </div>

      <form className="space-y-5" onSubmit={(event) => void saveProfile(event)}>
        {/* Full Name */}
        <div>
          <label htmlFor="customer-name" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} className="text-emerald-800" /> Full name
            </span>
          </label>
          <input
            id="customer-name"
            autoComplete="name"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
            placeholder="Your full name"
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="customer-email" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} className="text-emerald-800" /> Email address
            </span>
          </label>
          <input
            id="customer-email"
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
            placeholder="your.email@example.com"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Used for rental confirmations, invoices, and system alerts.
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="customer-phone" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-800" /> Contact phone number
            </span>
          </label>
          <input
            id="customer-phone"
            autoComplete="tel"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Shipping / Delivery Address */}
        <div>
          <label htmlFor="customer-address" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-emerald-800" /> Default delivery address
            </span>
          </label>
          <textarea
            id="customer-address"
            rows={3}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none"
            onChange={(event) => setAddress(event.target.value)}
            value={address}
            placeholder="Street address, apartment, city, state, postal code"
          />
        </div>

        {/* Status alerts */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700" role="alert">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800" role="status">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>Your profile has been saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
