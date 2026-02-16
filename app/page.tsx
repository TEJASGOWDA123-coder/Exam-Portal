"use client";

import { useExam } from "@/hooks/contexts/ExamContext";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  BarChart,
  ArrowRight,
  CheckCircle2,
  Users,
  Laptop
} from "lucide-react";

export default function LandingPage() {
  const { exams } = useExam();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span>ExamPortal</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/admin">
              <Button variant="default" size="sm" className="font-bold hidden sm:flex">
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Now with AI-Powered Proctoring
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-fade-in-up delay-100">
                Secure & Intelligent <br /> Examination Platform
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up delay-200">
                Conduct seamless online exams with real-time proctoring, automated grading, and instant performance analytics. Designed for scalability and integrity.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up delay-300">
                <Link href="/admin">
                  <Button size="lg" className="h-12 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base font-bold">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Background Gradients */}
          <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/30 to-purple-500/30 opacity-30" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/50 bg-muted/30">
          <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Exams", value: exams.filter(e => e.status === 'active').length + "+", icon: Clock },
              { label: "Candidates", value: "1000+", icon: Users },
              { label: "Uptime", value: "99.9%", icon: CheckCircle2 },
              { label: "Supported Devices", value: "All", icon: Laptop },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-background rounded-2xl shadow-sm border border-border">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 sm:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need for online assessment</h2>
              <p className="mt-4 text-lg text-muted-foreground">Comprehensive tools for administrators and a seamless experience for candidates.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Advanced Proctoring",
                  desc: "AI-driven monitoring detecting tab switches, multiple faces, and suspicious audio to ensure exam integrity.",
                  icon: ShieldCheck,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10"
                },
                {
                  title: "Instant Analytics",
                  desc: "Real-time grading and detailed performance reports. Export results to CSV instantly for record keeping.",
                  icon: BarChart,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  title: "Smart Question Bank",
                  desc: "Upload PDFs to auto-generate questions or use our intuitive editor. Support for MCQ, MSQ, and subjective answers.",
                  icon: GraduationCap,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full ${feature.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with Next.js & AI. © 2026 ExamPortal Inc.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
