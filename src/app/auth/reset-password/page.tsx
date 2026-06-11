import { Suspense } from "react";
import ResetPasswordContent from "./reset-password-content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
