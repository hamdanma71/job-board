"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export default function FollowButton({
  companyId,
  initialFollowing,
  initialCount,
  isLoggedIn,
}: {
  companyId: string;
  initialFollowing: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/follow`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
        setCount((c) => c + (data.following ? 1 : -1));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${following ? "btn-outline" : "btn-primary"}`}
      style={{ fontSize: "0.9rem", padding: "0.5rem 1.2rem" }}
    >
      {following ? t("follow.following") : t("follow.follow")} {count > 0 && `(${count})`}
    </button>
  );
}
