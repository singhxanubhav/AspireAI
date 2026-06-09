import { BookOpen, Bot, Code, ChartNoAxesColumnIncreasing } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Learn",
    subtitle: "Step-by-step coding tutorials designed for beginners.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Bot,
    title: "Ask AI",
    subtitle: "Get instant help from Astra, your AI coding buddy.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Code,
    title: "Practice",
    subtitle: "Hands-on coding exercises with real-time feedback.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Track Progress",
    subtitle: "Monitor your learning journey with detailed insights.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-primary">
            Everything you need to master coding
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            From guided lessons to AI-powered help — we&apos;ve got you covered
            at every stage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl bg-brand-card p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-primary/5 border border-transparent hover:border-brand-primary/10"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
