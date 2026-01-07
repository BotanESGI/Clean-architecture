"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacyConfirmRedirect() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      router.replace(`/confirm/${token}`);
    }
  }, [token, router]);

  return null;
}


