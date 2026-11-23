"use client";

import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function PasswordInput({
  id,
  label,
  value,
  autoComplete,
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121c15] px-3.5 py-2.5 pr-11 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none transition focus:border-emerald-700 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10"
          onChange={onChange}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
