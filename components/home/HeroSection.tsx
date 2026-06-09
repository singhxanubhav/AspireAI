"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  user?: {
    name?: string | null;
  } | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary/5 via-white to-brand-accent/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            {user && (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-accent/10 px-4 py-1.5 text-sm font-medium text-brand-accent">
                <Sparkles className="h-4 w-4" />
                Welcome back, {user.name || "Learner"}!
              </div>
            )}

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-brand-primary leading-tight">
                Learn Coding &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-pink-400">
                  AI
                </span>{" "}
                — The Smart Way
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
                Step-by-step tutorials, hands-on practice, and an AI tutor
                available 24/7. Perfect for beginners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={user ? "/learn" : "/register"}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 transition-all"
                >
                  {user ? "Continue Learning" : "Start Learning Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-base rounded-xl border-gray-200 hover:border-brand-accent hover:text-brand-accent"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Join <strong className="text-gray-700">2,000+</strong> learners</span>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />

              <div className="relative rounded-2xl bg-[#1A1A2E] shadow-2xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#252540] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">hello.py</span>
                </div>
                <div className="p-5 font-mono text-sm leading-7">
                  <div>
                    <span className="text-purple-400">def</span>{' '}
                    <span className="text-yellow-300">greet</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-orange-300">name</span>
                    <span className="text-gray-300">):</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-blue-300">print</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-green-300">f</span>
                    <span className="text-green-300">{'"Hello, {name}!"'}</span>
                    <span className="text-gray-300">)</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-purple-400">name</span>{' '}
                    <span className="text-gray-300">=</span>{' '}
                    <span className="text-green-300">{'"AspireAI"'}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">greet</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-orange-300">name</span>
                    <span className="text-gray-300">)</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 text-green-400">
                    <span className="text-gray-500"># </span>
                    <span className="text-green-400">&gt; Hello, AspireAI!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
