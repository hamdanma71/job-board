"use client";

import { signOut } from "next-auth/react";
import { useT } from "@/components/I18nProvider";

export default function LogoutButton() {
  const t = useT();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn btn-outline"
      style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem" }}
    >
      {t("nav.logout")}
    </button>
  );
}
