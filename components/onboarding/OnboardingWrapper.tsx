"use client";

import { useState } from "react";
import { OnboardingModal } from "./OnboardingModal";

export function OnboardingWrapper({
  onboardingCompleted,
  userName,
}: {
  onboardingCompleted: boolean;
  userName: string | null;
}) {
  const [show, setShow] = useState(!onboardingCompleted);

  if (!show) return null;

  return <OnboardingModal name={userName} onCompleteAction={() => setShow(false)} />;
}
