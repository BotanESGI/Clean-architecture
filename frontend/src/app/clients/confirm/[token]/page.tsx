import React from "react";
import { redirect } from "next/navigation";

export default function LegacyConfirmRedirect({ params }: { params: Promise<{ token: string }> }) {
  const p = React.use(params);
  redirect(`/confirm/${p.token}`);
}


