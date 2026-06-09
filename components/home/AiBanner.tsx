import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle } from "lucide-react";

export default function AiBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-violet-700 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 shrink-0">
              <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-brand-accent" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Meet <span className="text-brand-accent">Astra</span>, your AI
                coding buddy!
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-xl">
                Ask anything — from &quot;what is a variable?&quot; to &quot;how
                does AI work?&quot; Astra is always here to help.
              </p>
            </div>

            <Link href="/learn">
              <Button className="shrink-0 bg-white text-brand-primary hover:bg-white/90 px-6 py-6 text-base rounded-xl shadow-lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with Astra
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
