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
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { PageIntro } from "@/components/dashboard/DashboardUI";
import ProfileImageUploader from "@/components/profile/ProfileImageUploader";
import { apiRequest, formatDate, getErrorMessage, type User } from "@/lib/api";

type ProfileResponse = { user: User };

export default function AdminProfile() {
  const { user, token, reloadUser } = useAuth();

  return (
    <>
      <PageIntro
        eyebrow="System Administration"
        title="Admin Profile"
        description="Manage your administrator credentials, emergency contact info, and profile avatar."
      />

      <div key={user?._id || "admin"} className="grid gap-6 lg:grid-cols-3 max-w-5xl">
        {/* Left Column: Avatar & Superuser Badge */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-5">
              Admin Profile Photo
            </h3>
            <div className="flex flex-col items-center text-center">
              <ProfileImageUploader size="xl" showDetails={false} />
              <p className="mt-4 text-sm font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-900 border border-purple-200/60 uppercase tracking-wider">
                  <ShieldCheck size={12} /> System Admin
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 capitalize">
                  <Sparkles size={11} /> {user?.authProvider || "email"} Auth
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-4 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Security Clearance</span>
                <span className="font-semibold text-purple-900 flex items-center gap-1">
                  <KeyRound size={13} /> Full Access
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

        {/* Right Column: Admin Profile Details Form */}
        <AdminProfileForm user={user} token={token} reloadUser={reloadUser} />
      </div>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </>
  );
}

function AdminProfileForm({
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
        <h2 className="text-lg font-bold text-neutral-900">Administrator Credentials</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          These details are recorded on audit logs, platform approvals, and management actions.
        </p>
      </div>

      <form className="space-y-5" onSubmit={(event) => void saveProfile(event)}>
        {/* Full Name */}
        <div>
          <label htmlFor="admin-name" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} className="text-emerald-800" /> Full name
            </span>
          </label>
          <input
            id="admin-name"
            autoComplete="name"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
            placeholder="Administrator full name"
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="admin-email" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} className="text-emerald-800" /> Admin email address
            </span>
          </label>
          <input
            id="admin-email"
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
            placeholder="admin@rentora.com"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="admin-phone" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-800" /> Emergency phone
            </span>
          </label>
          <input
            id="admin-phone"
            autoComplete="tel"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Office / Headquarters Location */}
        <div>
          <label htmlFor="admin-address" className="block text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-emerald-800" /> Admin office / Location
            </span>
          </label>
          <textarea
            id="admin-address"
            rows={3}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none"
            onChange={(event) => setAddress(event.target.value)}
            value={address}
            placeholder="HQ / Office address, City, Country"
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
            <span>Admin profile updated successfully.</span>
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
