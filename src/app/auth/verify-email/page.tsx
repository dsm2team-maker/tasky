import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
