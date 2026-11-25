"use client";

import toast, { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "14px",
          border: "1px solid #e3e8e3",
          background: "#ffffff",
          color: "#26352c",
          fontSize: "13px",
          maxWidth: "420px",
        },
        success: { duration: 3500, iconTheme: { primary: "#357148", secondary: "#ffffff" } },
        error: { duration: 5000, iconTheme: { primary: "#b74e34", secondary: "#ffffff" } },
      }}
    />
  );
}

export const notifications = {
  success(message: string) {
    return toast.success(message);
  },
  error(message: string) {
    return toast.error(message);
  },
  warning(message: string) {
    return toast(message, {
      icon: "!",
      duration: 4500,
      style: { border: "1px solid #edc887", background: "#fffaf0", color: "#7a5821" },
    });
  },
  info(message: string) {
    return toast(message, {
      icon: "i",
      duration: 4000,
      style: { border: "1px solid #cbd8d0", background: "#f7faf8", color: "#31513c" },
    });
  },
  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      toast(
        (current) => (
          <div className="min-w-[280px]">
            <p className="text-sm font-semibold leading-5 text-[#26352c]">{message}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-[#dfe6df] px-3 py-1.5 text-xs font-semibold text-[#647168]"
                onClick={() => {
                  toast.dismiss(current.id);
                  resolve(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-[#14251e] px-3 py-1.5 text-xs font-semibold text-white"
                onClick={() => {
                  toast.dismiss(current.id);
                  resolve(true);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
    });
  },
};
