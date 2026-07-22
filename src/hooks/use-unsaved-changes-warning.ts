import { useEffect } from "react";

// Warns before the tab is closed/refreshed while there are unsaved edits.
// Doesn't intercept in-app route changes (the App Router has no built-in
// navigation-blocking hook to hang that on) — this covers the highest-risk
// case, an admin closing the tab or hitting refresh mid-edit on a long form.
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
