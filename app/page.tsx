// 'use client';

// import { useState, useEffect, useRef, type ReactNode } from 'react';
// import Link from 'next/link';
// import { Shield, Eye, BarChart3, Clock, Users, FileCheck, Lock, Zap, CheckCircle2, ArrowRight, TrendingUp, Award, AlertTriangle, Star } from 'lucide-react';
// import { ModeToggle } from '@/components/pageComponents/ModeToggle';
// import { Button } from '@/components/ui/button';
// import Header from '@/components/Header';

// /* ── Scroll-triggered animation ─────────────────────── */
// function useInView(threshold = 0.15) {
//   const ref = useRef<HTMLDivElement>(null);
//   const [inView, setInView] = useState(false);
//   useEffect(() => {
//     const obs = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
//     }, { threshold });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, [threshold]);
//   return [ref, inView] as const;
// }

// function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
//   const [ref, inView] = useInView();
//   return (
//     <div
//       ref={ref}
//       className={className}
//       style={{
//         opacity: inView ? 1 : 0,
//         transform: inView ? 'translateY(0px)' : 'translateY(36px)',
//         transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// /* ── Data ───────────────────────────────────────────── */
// const FEATURES = [
//   { icon: Eye, title: 'AI-Powered Proctoring', desc: 'Advanced AI monitors student behavior in real-time, detecting suspicious activities and ensuring exam integrity without human intervention.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
//   { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Comprehensive dashboards provide instant insights into exam performance, student progress, and detailed statistics.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
//   { icon: AlertTriangle, title: 'Violation Detection', desc: 'Automatically track tab switches, fullscreen exits, copy-paste attempts, and other violations with instant alerts.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
//   { icon: Clock, title: 'Progress Tracking', desc: 'Monitor student progress in real-time with live updates on answered questions, time remaining, and completion status.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
//   { icon: Lock, title: 'Fullscreen Enforcement', desc: 'Mandatory fullscreen mode prevents students from accessing external resources, maintaining exam integrity.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
//   { icon: Zap, title: 'High Performance', desc: 'Built for scale with optimized performance, handling thousands of concurrent exams without lag or downtime.', color: 'text-sky-400', bg: 'bg-sky-500/10' },
// ];

// const SECURITY = [
//   { icon: Shield, title: 'AI Proctoring', desc: 'Machine learning algorithms continuously monitor and analyze student behavior patterns.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
//   { icon: Eye, title: 'Tab Switch Detection', desc: 'Instantly detect and log whenever students switch tabs or applications during the exam.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
//   { icon: Lock, title: 'Copy-Paste Prevention', desc: 'Disable copy-paste functionality and track any attempts to circumvent exam restrictions.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
//   { icon: AlertTriangle, title: 'Real-Time Alerts', desc: 'Instant notifications to administrators when violations are detected for immediate action.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
//   { icon: TrendingUp, title: 'Behavioral Analysis', desc: 'Track patterns and generate detailed reports on student behavior throughout the examination.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
//   { icon: Award, title: 'Integrity Score', desc: 'Automated integrity scoring system based on violation history and behavioral patterns.', color: 'text-sky-400', bg: 'bg-sky-500/10' },
// ];

// const STATS = [
//   { value: '50K+', label: 'Exams Conducted' },
//   { value: '25K+', label: 'Students Enrolled' },
//   { value: '99.2%', label: 'Uptime' },
//   { value: '24/7', label: 'Support' },
// ];

// /* ── Page ───────────────────────────────────────────── */
// export default function LandingPage() {
//   const [liveCount, setLiveCount] = useState(1247);

//   useEffect(() => {
//     const iv = setInterval(() => {
//       setLiveCount(v => v + Math.floor(Math.random() * 3 - 1));
//     }, 2200);
//     return () => clearInterval(iv);
//   }, []);

//   return (
//     <div className="min-h-screen bg-background text-foreground">

//       {/* ── Header ────────────────────────────────── */}
//       <Header />

//       {/* ── Hero ─────────────────────────────────── */}
//       <section id="home" className="relative overflow-hidden py-28 sm:py-36">
//         {/* Background orbs */}
//         <div className="pointer-events-none absolute inset-0 -z-10">
//           <div className="absolute -top-32 -left-24 w-[580px] h-[580px] rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)', filter: 'blur(75px)' }} />
//           <div className="absolute top-16 -right-16 w-[460px] h-[460px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(75px)' }} />
//           <div className="absolute -bottom-20 left-[42%] w-[380px] h-[380px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(75px)' }} />
//           {/* Grid overlay */}
//           <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 80%)' }} />
//         </div>

//         <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center relative z-10">
//           {/* Left */}
//           <div>
//             <AnimatedSection>
//               <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-6">
//                 <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" /></span>
//                 AI-Powered Examination Platform
//               </span>
//             </AnimatedSection>

//             <AnimatedSection delay={100}>
//               <h1 className="font-black tracking-tight leading-[1.1] mb-5" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)' }}>
//                 Secure AI-Powered<br />
//                 <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Online Examination</span><br />
//                 System
//               </h1>
//             </AnimatedSection>

//             <AnimatedSection delay={200}>
//               <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)' }}>
//                 Experience next-generation online assessments with real-time AI proctoring,
//                 intelligent violation detection, and comprehensive analytics.
//               </p>
//             </AnimatedSection>

//             <AnimatedSection delay={300}>
//               <div className="flex flex-wrap gap-3 mb-8">
//                 <Button asChild size="lg" className="h-12 px-7 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
//                   <Link href="/admin">Start Exam <ArrowRight className="ml-2 w-4 h-4" /></Link>
//                 </Button>
//                 <Button asChild variant="outline" size="lg" className="h-12 px-7 rounded-xl font-bold hover:-translate-y-0.5 transition-all">
//                   <Link href="#features">View Demo</Link>
//                 </Button>
//               </div>
//             </AnimatedSection>

//             <AnimatedSection delay={400}>
//               <div className="flex flex-wrap gap-5">
//                 {['Real-time Monitoring', 'AI Proctoring', 'Detailed Analytics'].map(t => (
//                   <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                     <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
//                     {t}
//                   </span>
//                 ))}
//               </div>
//             </AnimatedSection>
//           </div>

//           {/* Right — Hero Card */}
//           <AnimatedSection delay={350} className="hidden lg:block">
//             <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/40 animate-float">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30">
//                     <Shield className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold">Active Monitoring</div>
//                     <div className="text-xs text-muted-foreground">System Status</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-500">
//                   <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
//                   LIVE
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <div className="rounded-xl border border-border bg-muted/50 p-3.5">
//                   <div className="text-xl font-black tracking-tight">{liveCount.toLocaleString()}</div>
//                   <div className="text-xs text-muted-foreground mt-0.5">Active Exams</div>
//                 </div>
//                 <div className="rounded-xl border border-border bg-muted/50 p-3.5">
//                   <div className="text-xl font-black tracking-tight">98.5%</div>
//                   <div className="text-xs text-muted-foreground mt-0.5">Success Rate</div>
//                 </div>
//               </div>

//               <div className="rounded-xl border border-border bg-muted/50 p-3.5 mb-3">
//                 <div className="flex justify-between text-xs mb-2">
//                   <span className="text-muted-foreground">Security Score</span>
//                   <span className="font-semibold text-emerald-500">Excellent · 95%</span>
//                 </div>
//                 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
//                   <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 w-[95%]" />
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 py-2 border-t border-border text-xs text-muted-foreground">
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
//                 <span>Student #3841 flagged for tab switch</span>
//                 <span className="ml-auto">2s ago</span>
//               </div>
//               <div className="flex items-center gap-2 py-2 border-t border-border text-xs text-muted-foreground">
//                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
//                 <span>Exam #1104 started — 42 candidates</span>
//                 <span className="ml-auto">18s ago</span>
//               </div>
//             </div>
//           </AnimatedSection>
//         </div>
//       </section>

//       {/* ── Stats ────────────────────────────────── */}
//       <section className="border-y border-border/50 bg-muted/30 py-10">
//         <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
//           {STATS.map(({ value, label }, i) => (
//             <AnimatedSection key={label} delay={i * 90}>
//               <div className="text-center md:border-r md:last:border-r-0 border-border/50">
//                 <div className="text-3xl font-black tracking-tight">{value}</div>
//                 <div className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{label}</div>
//               </div>
//             </AnimatedSection>
//           ))}
//         </div>
//       </section>

//       {/* ── Features ─────────────────────────────── */}
//       <section id="features" className="py-24 sm:py-32 bg-background">
//         <div className="container max-w-7xl mx-auto px-4 sm:px-6">
//           <AnimatedSection>
//             <div className="text-center max-w-xl mx-auto mb-14">
//               <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Features</span>
//               <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Powerful Tools for Modern Examinations</h2>
//               <p className="text-muted-foreground leading-relaxed">Everything you need to conduct secure, efficient, and intelligent online assessments</p>
//             </div>
//           </AnimatedSection>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
//               <AnimatedSection key={title} delay={i * 75}>
//                 <div className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:border-primary/30">
//                   <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
//                     <Icon className={`w-5 h-5 ${color}`} />
//                   </div>
//                   <h3 className="text-base font-bold mb-2">{title}</h3>
//                   <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
//                 </div>
//               </AnimatedSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Roles ────────────────────────────────── */}
//       <section id="about" className="py-24 sm:py-32 bg-card">
//         <div className="container max-w-7xl mx-auto px-4 sm:px-6">
//           <AnimatedSection>
//             <div className="text-center max-w-lg mx-auto mb-14">
//               <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">User Roles</span>
//               <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Designed for Everyone</h2>
//               <p className="text-muted-foreground leading-relaxed">Tailored experiences for administrators and students</p>
//             </div>
//           </AnimatedSection>

//           <div className="grid md:grid-cols-2 gap-6">
//             {/* Admin */}
//             <AnimatedSection delay={100}>
//               <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-8">
//                 <div className="flex items-center gap-4 mb-6">
//                   <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 p-3">
//                     <Shield className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <div className="text-xl font-black">Administrator</div>
//                     <div className="text-xs text-muted-foreground">Complete control and oversight</div>
//                   </div>
//                 </div>
//                 {[['Exam Creation & Management', 'Create, edit, and schedule exams with customizable settings'],
//                 ['User Management', 'Add, remove, and manage student accounts and permissions'],
//                 ['Analytics Dashboard', 'Comprehensive insights, reports, and performance metrics'],
//                 ['Violation Monitoring', 'Real-time alerts and detailed violation logs']].map(([t, d]) => (
//                   <div key={t} className="flex gap-3 mb-4 last:mb-0">
//                     <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
//                     <div>
//                       <div className="text-sm font-semibold">{t}</div>
//                       <div className="text-xs text-muted-foreground leading-relaxed">{d}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </AnimatedSection>

//             {/* Student */}
//             <AnimatedSection delay={200}>
//               <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-8">
//                 <div className="flex items-center gap-4 mb-6">
//                   <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 p-3">
//                     <Users className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <div className="text-xl font-black">Student</div>
//                     <div className="text-xs text-muted-foreground">Seamless exam experience</div>
//                   </div>
//                 </div>
//                 {[['Live Exam Interface', 'Intuitive interface with timer, question navigation, and auto-save'],
//                 ['Answer Review', 'Review and modify answers before final submission'],
//                 ['Progress Tracking', 'View attempted, unattempted, and flagged questions'],
//                 ['Results & Feedback', 'Instant results with detailed performance analysis']].map(([t, d]) => (
//                   <div key={t} className="flex gap-3 mb-4 last:mb-0">
//                     <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
//                     <div>
//                       <div className="text-sm font-semibold">{t}</div>
//                       <div className="text-xs text-muted-foreground leading-relaxed">{d}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </AnimatedSection>
//           </div>
//         </div>
//       </section>

//       {/* ── Security ─────────────────────────────── */}
//       <section id="security" className="relative py-24 sm:py-32 overflow-hidden bg-[#04080f] dark:bg-[#04080f]">
//         {/* Orbs */}
//         <div className="pointer-events-none absolute -top-24 -right-20 w-[480px] h-[480px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(90px)' }} />
//         <div className="pointer-events-none absolute -bottom-20 -left-10 w-[380px] h-[380px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', filter: 'blur(90px)' }} />

//         <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
//           <AnimatedSection>
//             <div className="text-center max-w-lg mx-auto mb-14">
//               <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">Security First</span>
//               <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">Enterprise-Grade Security</h2>
//               <p className="text-white/50 leading-relaxed">Maintain academic integrity with advanced AI-powered security features</p>
//             </div>
//           </AnimatedSection>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {SECURITY.map(({ icon: Icon, title, desc, color, bg }, i) => (
//               <AnimatedSection key={title} delay={i * 75}>
//                 <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 hover:-translate-y-1 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-300">
//                   <div className={`w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4`}>
//                     <Icon className={`w-5 h-5 ${color}`} />
//                   </div>
//                   <h3 className="text-base font-bold text-white mb-2">{title}</h3>
//                   <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
//                 </div>
//               </AnimatedSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ──────────────────────────────────── */}
//       <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600">
//         <div className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-white/[0.07]" style={{ filter: 'blur(75px)' }} />
//         <div className="pointer-events-none absolute -bottom-16 -right-12 w-[300px] h-[300px] rounded-full bg-white/[0.07]" style={{ filter: 'blur(75px)' }} />

//         <div className="container max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
//           <AnimatedSection>
//             <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white mb-6">
//               <Star className="w-2.5 h-2.5" fill="white" />
//               Trusted by 500+ Institutions
//             </div>
//             <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Ready to Transform Your Online Examinations?</h2>
//             <p className="text-white/70 mb-8 leading-relaxed">Join thousands of institutions already using ExamPortal for secure, intelligent assessments</p>
//             <div className="flex flex-wrap gap-3 justify-center">
//               <Button asChild size="lg" className="h-12 px-8 rounded-xl font-bold bg-white text-blue-700 hover:bg-white/90 shadow-lg shadow-black/15 hover:-translate-y-0.5 transition-all">
//                 <Link href="/admin">Get Started Free</Link>
//               </Button>
//               <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl font-bold border-white/35 text-white hover:bg-white/10 hover:border-white/70 hover:-translate-y-0.5 transition-all">
//                 <Link href="#features">Schedule Demo</Link>
//               </Button>
//             </div>
//           </AnimatedSection>
//         </div>
//       </section>

//       {/* ── Footer ───────────────────────────────── */}
//       <footer className="bg-[#03060e] py-14 px-4 sm:px-6">
//         <div className="container max-w-7xl mx-auto">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
//             <div className="col-span-2 md:col-span-1">
//               <Link href="/" className="flex items-center gap-2.5 mb-3">
//                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
//                   <FileCheck className="w-4 h-4 text-white" />
//                 </div>
//                 <span className="font-black text-base bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ExamPortal</span>
//               </Link>
//               <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">Secure, intelligent, and scalable online examination platform powered by AI.</p>
//             </div>
//             {[
//               ['Product', ['Features', 'Pricing', 'Security', 'Updates']],
//               ['Resources', ['Documentation', 'API Reference', 'Support', 'Status']],
//               ['Company', ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service']],
//             ].map(([title, links]) => (
//               <div key={title as string}>
//                 <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">{title as string}</div>
//                 <ul className="space-y-2">
//                   {(links as string[]).map(l => (
//                     <li key={l}><a href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors">{l}</a></li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//           <div className="border-t border-white/[0.06] pt-6 flex justify-between items-center">
//             <span className="text-xs text-white/20">© 2026 ExamPortal. All rights reserved.</span>
//             <div className="flex gap-1.5">
//               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
//               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
//               <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }



'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Shield, Eye, BarChart3, Clock, Users, FileCheck, Lock,
  Zap, CheckCircle2, ArrowRight, TrendingUp, Award, AlertTriangle, Star,
} from 'lucide-react';
import { ModeToggle } from '@/components/pageComponents/ModeToggle';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

/* ── Scroll-triggered animation ─────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function AnimatedSection({
  children, className = '', delay = 0, direction = 'up',
}: {
  children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'left' | 'right';
}) {
  const [ref, inView] = useInView();
  const translate = direction === 'left'
    ? 'translateX(-28px)'
    : direction === 'right'
      ? 'translateX(28px)'
      : 'translateY(32px)';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate(0)' : translate,
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/* ── Floating orb helper ────────────────────────────── */
function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ filter: 'blur(80px)', ...style }}
    />
  );
}

/* ── Data ───────────────────────────────────────────── */
const FEATURES = [
  { icon: Eye, title: 'AI-Powered Proctoring', desc: 'Advanced AI monitors student behavior in real-time, detecting suspicious activities and ensuring exam integrity without human intervention.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Comprehensive dashboards provide instant insights into exam performance, student progress, and detailed statistics.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
  { icon: AlertTriangle, title: 'Violation Detection', desc: 'Automatically track tab switches, fullscreen exits, copy-paste attempts, and other violations with instant alerts.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/30' },
  { icon: Clock, title: 'Progress Tracking', desc: 'Monitor student progress in real-time with live updates on answered questions, time remaining, and completion status.', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30' },
  { icon: Lock, title: 'Fullscreen Enforcement', desc: 'Mandatory fullscreen mode prevents students from accessing external resources, maintaining exam integrity.', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/30' },
  { icon: Zap, title: 'High Performance', desc: 'Built for scale with optimized performance, handling thousands of concurrent exams without lag or downtime.', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'hover:border-sky-500/30' },
];

const SECURITY = [
  { icon: Shield, title: 'AI Proctoring', desc: 'Machine learning algorithms continuously monitor and analyze student behavior patterns.', color: 'text-blue-400' },
  { icon: Eye, title: 'Tab Switch Detection', desc: 'Instantly detect and log whenever students switch tabs or applications during the exam.', color: 'text-emerald-400' },
  { icon: Lock, title: 'Copy-Paste Prevention', desc: 'Disable copy-paste functionality and track any attempts to circumvent exam restrictions.', color: 'text-violet-400' },
  { icon: AlertTriangle, title: 'Real-Time Alerts', desc: 'Instant notifications to administrators when violations are detected for immediate action.', color: 'text-orange-400' },
  { icon: TrendingUp, title: 'Behavioral Analysis', desc: 'Track patterns and generate detailed reports on student behavior throughout the examination.', color: 'text-pink-400' },
  { icon: Award, title: 'Integrity Score', desc: 'Automated integrity scoring system based on violation history and behavioral patterns.', color: 'text-sky-400' },
];

const STATS = [
  { value: '50K+', label: 'Exams Conducted' },
  { value: '25K+', label: 'Students Enrolled' },
  { value: '99.2%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

const ADMIN_FEATURES = [
  ['Exam Creation & Management', 'Create, edit, and schedule exams with customizable settings'],
  ['User Management', 'Add, remove, and manage student accounts and permissions'],
  ['Analytics Dashboard', 'Comprehensive insights, reports, and performance metrics'],
  ['Violation Monitoring', 'Real-time alerts and detailed violation logs'],
];

const STUDENT_FEATURES = [
  ['Live Exam Interface', 'Intuitive interface with timer, question navigation, and auto-save'],
  ['Answer Review', 'Review and modify answers before final submission'],
  ['Progress Tracking', 'View attempted, unattempted, and flagged questions'],
  ['Results & Feedback', 'Instant results with detailed performance analysis'],
];

/* ── Animated count-up hook ─────────────────────────── */
function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

/* ── Page ───────────────────────────────────────────── */
export default function LandingPage() {
  const [liveCount, setLiveCount] = useState(1247);
  const [statsRef, statsInView] = useInView(0.3);

  /* Subtle live counter drift */
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveCount(v => v + Math.floor(Math.random() * 3 - 1));
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ── Hero ────────────────────────────────── */}
      <section id="home" className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Orb className="w-[600px] h-[600px] -top-40 -left-32 opacity-[0.18]" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)' }} />
          <Orb className="w-[480px] h-[480px] top-10 -right-20 opacity-[0.13]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
          <Orb className="w-[400px] h-[400px] -bottom-24 left-[40%] opacity-[0.12]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)' }} />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 85% 85% at 50% 40%, black 20%, transparent 80%)',
            }}
          />
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* Left */}
          <div className="flex flex-col items-start">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                AI-Powered Examination Platform
              </span>
            </AnimatedSection>

            <AnimatedSection delay={80}>
              <h1
                className="font-black tracking-tight leading-[1.08] mb-5 text-foreground"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)' }}
              >
                Secure AI-Powered<br />
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-sky-500 bg-clip-text text-transparent">
                  Online Examination
                </span>
                <br />System
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={160}>
              <p
                className="text-muted-foreground leading-relaxed mb-8 max-w-lg"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)' }}
              >
                Experience next-generation online assessments with real-time AI proctoring,
                intelligent violation detection, and comprehensive analytics.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={240}>
              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  asChild size="lg"
                  className="h-11 sm:h-12 px-6 sm:px-7 rounded-xl font-bold
                    shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35
                    hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                    transition-all duration-200"
                >
                  <Link href="/admin">
                    Start Exam <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild variant="outline" size="lg"
                  className="h-11 sm:h-12 px-6 sm:px-7 rounded-xl font-bold
                    hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                    transition-all duration-200"
                >
                  <Link href="#features">View Demo</Link>
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={320}>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {['Real-time Monitoring', 'AI Proctoring', 'Detailed Analytics'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Right — Hero Card */}
          <AnimatedSection delay={200} direction="right" className="hidden lg:block">
            <div
              className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl
                p-5 sm:p-6 shadow-2xl shadow-black/10 dark:shadow-black/40"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Active Monitoring</div>
                    <div className="text-xs text-muted-foreground">System Status</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-500 shrink-0">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-border bg-muted/50 p-3.5">
                  <div className="text-xl font-black tracking-tight tabular-nums">{liveCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Active Exams</div>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-3.5">
                  <div className="text-xl font-black tracking-tight">98.5%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Success Rate</div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-3.5 mb-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Security Score</span>
                  <span className="font-semibold text-emerald-500">Excellent · 95%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                    style={{ width: '95%', transition: 'width 1s ease-out' }}
                  />
                </div>
              </div>

              {[
                { color: 'bg-emerald-500', msg: 'Student #3841 flagged for tab switch', time: '2s ago' },
                { color: 'bg-blue-500', msg: 'Exam #1104 started — 42 candidates', time: '18s ago' },
              ].map(({ color, msg, time }) => (
                <div key={msg} className="flex items-center gap-2 py-2 border-t border-border text-xs text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
                  <span className="truncate">{msg}</span>
                  <span className="ml-auto shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <section ref={statsRef} className="border-y border-border/50 bg-muted/30 py-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }, i) => (
            <AnimatedSection key={label} delay={i * 70}>
              <div className="text-center md:border-r md:last:border-r-0 border-border/50 py-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums">{value}</div>
                <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-widest">{label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 lg:py-32 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Features</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4">
                Powerful Tools for Modern Examinations
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Everything you need to conduct secure, efficient, and intelligent online assessments
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <AnimatedSection key={title} delay={i * 60}>
                <div
                  className={`group rounded-2xl border border-border bg-card p-5 sm:p-6
                    hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5
                    dark:hover:shadow-black/25 ${border}
                    transition-all duration-300 cursor-default h-full`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center mb-4
                    group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold mb-2">{title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28 lg:py-32 bg-card">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center max-w-lg mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">User Roles</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4">
                Designed for Everyone
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Tailored experiences for administrators and students
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Admin */}
            <AnimatedSection delay={100} direction="left">
              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.06] to-transparent p-6 sm:p-8 h-full transition-all duration-300 hover:border-blue-500/35 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 p-2.5 sm:p-3">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black">Administrator</div>
                    <div className="text-xs text-muted-foreground">Complete control and oversight</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {ADMIN_FEATURES.map(([t, d]) => (
                    <div key={t} className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{t}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Student */}
            <AnimatedSection delay={180} direction="right">
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-6 sm:p-8 h-full transition-all duration-300 hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 p-2.5 sm:p-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black">Student</div>
                    <div className="text-xs text-muted-foreground">Seamless exam experience</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {STUDENT_FEATURES.map(([t, d]) => (
                    <div key={t} className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{t}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Security ─────────────────────────────── */}
      <section id="security" className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-[#04080f]">
        <Orb className="w-[480px] h-[480px] -top-24 -right-20 opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }} />
        <Orb className="w-[380px] h-[380px] -bottom-20 -left-10 opacity-20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)' }} />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-lg mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">Security First</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-4">
                Enterprise-Grade Security
              </h2>
              <p className="text-white/50 leading-relaxed text-sm sm:text-base">
                Maintain academic integrity with advanced AI-powered security features
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {SECURITY.map(({ icon: Icon, title, desc, color }, i) => (
              <AnimatedSection key={title} delay={i * 60}>
                <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 sm:p-6
                  hover:-translate-y-1.5 hover:bg-white/[0.08] hover:border-white/[0.14]
                  transition-all duration-300 cursor-default h-full">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4
                    group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-500">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-white/[0.06]" style={{ filter: 'blur(80px)' }} />
          <div className="absolute -bottom-20 -right-16 w-[380px] h-[380px] rounded-full bg-white/[0.06]" style={{ filter: 'blur(80px)' }} />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>

        <div className="container max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold text-white mb-6">
              <Star className="w-2.5 h-2.5" fill="white" />
              Trusted by 500+ Institutions
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
              Ready to Transform Your Online Examinations?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed text-sm sm:text-base max-w-xl mx-auto">
              Join thousands of institutions already using ExamPortal for secure, intelligent assessments
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                asChild size="lg"
                className="h-11 sm:h-12 px-7 sm:px-8 rounded-xl font-bold
                  bg-white text-blue-700 hover:bg-white/95
                  shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-black/20
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                  transition-all duration-200"
              >
                <Link href="/admin">Get Started Free</Link>
              </Button>
              <Button
                asChild variant="outline" size="lg"
                className="h-11 sm:h-12 px-7 sm:px-8 rounded-xl font-bold
                  border-white/60 text-white bg-white/10 backdrop-blur-sm
                  hover:bg-white/20 hover:border-white
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                  transition-all duration-200"
              >
                <Link href="#features">Schedule Demo</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="relative bg-[#03060e] pt-20 pb-10 px-4 sm:px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute -top-24 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 mb-16">
            {/* Brand Section */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  ExamPortal
                </span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed max-w-[280px] mb-8">
                The world's most advanced AI-powered examination platform for secure, scalable, and intelligent assessments.
              </p>
              <div className="flex gap-4">
                {['twitter', 'github', 'linkedin'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
                  >
                    <span className="sr-only">{social}</span>
                    {/* Placeholder for social icons using generic shapes for brevity */}
                    <div className="w-4 h-4 rounded-sm border-2 border-current" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              ['Product', ['Features', 'AI Proctoring', 'Security', 'Pricing']],
              ['Resources', ['Documentation', 'API Guide', 'Support', 'Status']],
              ['Company', ['About', 'Blog', 'Privacy', 'Terms']],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 className="text-sm font-bold text-white/80 mb-6 tracking-wide">{title as string}</h4>
                <ul className="space-y-4">
                  {(links as string[]).map(l => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-white/40 hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-xs text-white/25">© 2026 ExamPortal Inc.</span>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">Powered by NEXT.JS & AI</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}