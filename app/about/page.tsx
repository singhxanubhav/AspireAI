import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Bot, BookOpen, Code2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about AvenzaAI — the platform that helps beginners learn coding and AI.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent shadow-xl shadow-brand-primary/20">
              <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">AvenzaAI</h1>
              <p className="text-base sm:text-lg text-muted-foreground">Learn Coding & AI</p>
            </div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            A modern learning platform that combines structured coding lessons,
            hands-on practice exercises, and an AI tutor to help beginners master programming and AI concepts.
          </p>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="flex h-8 w-1 rounded-full bg-gradient-to-b from-brand-primary to-brand-accent" />
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">Features</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <BookOpen className="h-6 w-6" />, title: "Structured Courses", desc: "Step-by-step lessons covering Python, AI fundamentals, and more." },
              { icon: <Code2 className="h-6 w-6" />, title: "Interactive Practice", desc: "Real coding exercises with instant feedback and hints." },
              { icon: <Bot className="h-6 w-6" />, title: "AI Tutor (Astra)", desc: "24/7 AI-powered chat assistant for questions and debugging." },
              { icon: <Sparkles className="h-6 w-6" />, title: "Progress Tracking", desc: "Detailed dashboard with streaks, levels, and achievements." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border/40 bg-white dark:bg-white/[0.02] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary mb-4">
                  {f.icon}
                </span>
                <h3 className="text-base font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-brand-primary/[0.03] to-brand-accent/[0.03] p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-2">Get Started</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Ready to start your learning journey? Create a free account and dive into our courses.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild className="rounded-xl px-6">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-6">
                <Link href="/learn">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
