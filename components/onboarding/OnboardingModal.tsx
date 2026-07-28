"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Target, ArrowRight, Check, Lightbulb } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to AvenzaAI!",
    subtitle: "Let's get you started on your learning journey.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    title: "What's your goal?",
    subtitle: "Choose what you'd like to focus on:",
    icon: <Target className="h-8 w-8" />,
  },
  {
    title: "Meet Astra!",
    subtitle: "Your AI coding buddy available 24/7.",
    icon: <Bot className="h-8 w-8" />,
  },
];

export function OnboardingModal({
  name,
  onCompleteAction,
}: {
  name: string | null;
  onCompleteAction: () => void;
}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      onCompleteAction();
      router.refresh();
    } catch {
      onCompleteAction();
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md mx-4">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-2xl shadow-brand-primary/30">
            {STEPS[step].icon}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl pt-16 pb-6 px-6">
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-brand-primary"
                    : i < step
                      ? "w-4 bg-brand-primary/40"
                      : "w-4 bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold font-heading text-foreground">
                {STEPS[0].title}
              </h2>
              <p className="text-muted-foreground">
                Hey{name ? ` ${name}` : ""}! We&apos;re thrilled to have you here.
              </p>
              <p className="text-sm text-muted-foreground">
                AvenzaAI helps you learn coding and AI with step-by-step lessons,
                hands-on practice, and a personal AI tutor.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold font-heading text-foreground">
                {STEPS[1].title}
              </h2>
              <p className="text-sm text-muted-foreground">{STEPS[1].subtitle}</p>
              <div className="space-y-2.5">
                {[
                  { value: "PYTHON", label: "Learn Python", desc: "Master Python from scratch" },
                  { value: "AI", label: "Understand AI", desc: "Explore AI fundamentals" },
                  { value: "BOTH", label: "Both", desc: "Full-stack AI & Python" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGoal(option.value)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                      goal === option.value
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-primary/30"
                    }`}
                  >
                    <span className="text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="text-xs text-muted-foreground block">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold font-heading text-foreground">
                {STEPS[2].title}
              </h2>
              <p className="text-muted-foreground">
                Astra is your AI coding buddy — built right into AvenzaAI.
              </p>
              <div className="rounded-xl bg-brand-primary/[0.03] border border-brand-primary/10 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  <Bot className="h-4 w-4" />
                  Astra
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hey there! I&apos;m Astra. Ask me anything about coding, debug your code,
                  or get learning recommendations. I&apos;m here 24/7!
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                You can chat with Astra anytime using the chat button in the corner.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="text-sm"
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            {isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting up...
                  </span>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
                className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
