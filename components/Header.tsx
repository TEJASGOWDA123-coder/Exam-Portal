// "use client"

// import { GraduationCap, Menu, X } from 'lucide-react'
// import React, { useEffect, useState } from 'react'
// import { ModeToggle } from './pageComponents/ModeToggle'
// import { Button } from './ui/button'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// const navLinks = [
//     { label: 'Home', href: '#home' },
//     { label: 'Features', href: '#features' },
//     { label: 'About', href: '#about' },
//     { label: 'Security', href: '#security' },
// ]

// const Header = () => {
//     const [scrolled, setScrolled] = useState(false)
//     const [menuOpen, setMenuOpen] = useState(false)
//     const pathname = usePathname()

//     useEffect(() => {
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 10)
//             if (menuOpen) setMenuOpen(false)
//         }
//         window.addEventListener('scroll', handleScroll, { passive: true })
//         return () => window.removeEventListener('scroll', handleScroll)
//     }, [menuOpen])

//     return (
//         <header
//             className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
//                     ? 'bg-background/75 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/5'
//                     : 'bg-transparent'
//                 }`}
//         >
//             <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

//                 {/* Logo */}
//                 <Link href="/" className="flex items-center gap-2.5 font-black text-base tracking-tight shrink-0 group">
//                     <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-200">
//                         <GraduationCap className="w-4 h-4" />
//                     </div>
//                     <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
//                         ExamPortal
//                     </span>
//                 </Link>

//                 {/* Center Nav — desktop */}
//                 <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
//                     {navLinks.map((link) => {
//                         const isActive = pathname === link.href
//                         return (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
//                                         ? 'text-primary'
//                                         : 'text-muted-foreground hover:text-foreground'
//                                     }`}
//                             >
//                                 {/* Active pill background */}
//                                 {isActive && (
//                                     <span className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" />
//                                 )}
//                                 {/* Hover background */}
//                                 <span className="absolute inset-0 rounded-lg bg-accent opacity-0 hover:opacity-100 transition-opacity duration-150" />
//                                 <span className="relative">{link.label}</span>
//                             </Link>
//                         )
//                     })}
//                 </nav>

//                 {/* Right Actions */}
//                 <div className="flex items-center gap-2 sm:gap-3">
//                     {/* Mode Toggle with ring on hover */}
//                     <div className="hover:ring-2 hover:ring-border rounded-xl transition-all duration-200">
//                         <ModeToggle />
//                     </div>

//                     {/* Admin Console Button */}
//                     <Button
//                         asChild
//                         size="sm"
//                         className="h-8 px-4 rounded-xl font-bold text-xs hidden sm:flex
//                             bg-primary hover:bg-primary/90
//                             shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35
//                             transition-all duration-200 hover:scale-105"
//                     >
//                         <Link href="/admin">Admin Console</Link>
//                     </Button>

//                     {/* Hamburger — mobile */}
//                     <button
//                         className="md:hidden p-1.5 rounded-xl hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200"
//                         onClick={() => setMenuOpen((prev) => !prev)}
//                         aria-label="Toggle menu"
//                     >
//                         <div className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : 'rotate-0'}`}>
//                             {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//                         </div>
//                     </button>
//                 </div>
//             </div>

//             {/* Mobile Dropdown Menu */}
//             <div
//                 className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
//                     } bg-background/95 backdrop-blur-xl border-b border-border/40`}
//             >
//                 <nav className="flex flex-col px-4 pb-5 pt-2 gap-1">
//                     {navLinks.map((link) => {
//                         const isActive = pathname === link.href
//                         return (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 onClick={() => setMenuOpen(false)}
//                                 className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
//                                         ? 'text-primary bg-primary/10 border border-primary/20'
//                                         : 'text-muted-foreground hover:text-foreground hover:bg-accent'
//                                     }`}
//                             >
//                                 {link.label}
//                             </Link>
//                         )
//                     })}

//                     <div className="h-px bg-border/50 my-2" />

//                     <Button asChild size="sm" className="rounded-xl font-bold text-xs sm:hidden shadow-md shadow-primary/20">
//                         <Link href="/admin" onClick={() => setMenuOpen(false)}>
//                             Admin Console
//                         </Link>
//                     </Button>
//                 </nav>
//             </div>
//         </header>
//     )
// }

// export default Header



"use client"

import { GraduationCap, Menu, X } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { ModeToggle } from './pageComponents/ModeToggle'
import { Button } from './ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Security', href: '#security' },
]

const Header = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeLink, setActiveLink] = useState('#home')
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
    const navRef = useRef<HTMLDivElement>(null)
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
    const pathname = usePathname()

    /* Scroll + close menu on scroll */
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
            if (menuOpen) setMenuOpen(false)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [menuOpen])

    /* Gliding indicator: update position whenever activeLink changes */
    useEffect(() => {
        const el = linkRefs.current[activeLink]
        const nav = navRef.current
        if (!el || !nav) return
        const navRect = nav.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        setIndicatorStyle({
            left: elRect.left - navRect.left,
            width: elRect.width,
        })
    }, [activeLink])

    /* Intersection observer to track active section */
    useEffect(() => {
        const sections = navLinks.map(l => document.querySelector(l.href))
        if (sections.every(s => !s)) return

        const obs = new IntersectionObserver(
            entries => {
                const visible = entries.find(e => e.isIntersecting)
                if (visible) setActiveLink(`#${visible.target.id}`)
            },
            { threshold: 0.4 }
        )
        sections.forEach(s => s && obs.observe(s))
        return () => obs.disconnect()
    }, [])

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-background/80 backdrop-blur-2xl border-b border-border/40 shadow-sm shadow-black/5'
                : 'bg-transparent'
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 font-black text-base tracking-tight shrink-0 group"
                >
                    <div
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground
              flex items-center justify-center shadow-md shadow-primary/30
              group-hover:shadow-primary/50 group-hover:scale-110 group-hover:-rotate-3
              transition-all duration-300"
                    >
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        ExamPortal
                    </span>
                </Link>

                {/* Center Nav — desktop with gliding pill indicator */}
                <nav
                    ref={navRef}
                    className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
                >
                    {/* Gliding background pill */}
                    <span
                        className="absolute top-0 h-full rounded-lg bg-primary/10 border border-primary/20 transition-all duration-300 ease-out pointer-events-none"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                            opacity: indicatorStyle.width > 0 ? 1 : 0,
                        }}
                    />
                    {navLinks.map((link) => {
                        const isActive = activeLink === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                ref={el => { linkRefs.current[link.href] = el }}
                                onClick={() => setActiveLink(link.href)}
                                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hover:ring-2 hover:ring-border rounded-xl transition-all duration-200">
                        <ModeToggle />
                    </div>

                    <Button
                        asChild
                        size="sm"
                        className="h-8 px-4 rounded-xl font-bold text-xs hidden sm:flex
              bg-primary hover:bg-primary/90
              shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35
              transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Link href="/admin">Admin Console</Link>
                    </Button>

                    {/* Hamburger — mobile */}
                    <button
                        className="md:hidden p-1.5 rounded-xl hover:bg-accent border border-transparent
              hover:border-border/50 transition-all duration-200 active:scale-95"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        <div className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : 'rotate-0'}`}>
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } bg-background/95 backdrop-blur-2xl border-b border-border/40`}
            >
                <nav className="flex flex-col px-4 pb-5 pt-2 gap-1">
                    {navLinks.map((link, i) => {
                        const isActive = activeLink === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => { setMenuOpen(false); setActiveLink(link.href) }}
                                style={{ transitionDelay: menuOpen ? `${i * 40}ms` : '0ms' }}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${menuOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
                  ${isActive
                                        ? 'text-primary bg-primary/10 border border-primary/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}

                    <div className="h-px bg-border/50 my-2" />

                    <Button
                        asChild size="sm"
                        className="rounded-xl font-bold text-xs sm:hidden shadow-md shadow-primary/20 active:scale-95"
                    >
                        <Link href="/admin" onClick={() => setMenuOpen(false)}>
                            Admin Console
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    )
}

export default Header