"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, Mail, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useAppContext } from "../../AppContext"

export default function AdminLogin() {
  const { login, theme } = useAppContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState(null)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef(null)

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationId
    let particles = []
    let mouseX = 0
    let mouseY = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener("mousemove", handleMouseMove)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.3 + 0.05
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.02 + 0.005
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          this.x -= dx * force * 0.008
          this.y -= dy * force * 0.008
          this.opacity = Math.min(0.5, this.opacity + force * 0.1)
        }
        if (this.x < -10 || this.x > canvas.width + 10 ||
            this.y < -10 || this.y > canvas.height + 10) {
          this.reset()
        }
      }
      draw() {
        const glow = Math.sin(this.pulse) * 0.15 + 0.85
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * glow, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity * glow})`
        ctx.fill()
        if (this.size > 1.2) {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size * 3 * glow, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity * 0.08 * glow})`
          ctx.fill()
        }
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle())

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.06
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      drawConnections()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden ${
      isDark ? "bg-[#060608]" : "bg-[#f5f2ef]"
    }`}>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(60px, -80px); }
          50% { transform: translate(-40px, -50px); }
          75% { transform: translate(30px, 40px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-80px, 60px); }
          50% { transform: translate(50px, 90px); }
          75% { transform: translate(-30px, -40px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(40px, 70px); }
          50% { transform: translate(-60px, -30px); }
          75% { transform: translate(70px, -50px); }
        }
        @keyframes borderPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .orb-a { animation: float1 25s ease-in-out infinite; }
        .orb-b { animation: float2 30s ease-in-out infinite; }
        .orb-c { animation: float3 20s ease-in-out infinite; }
        .glow-border { animation: borderPulse 4s ease-in-out infinite; }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-[1]">
        <div className={`absolute top-[-30%] left-[-15%] w-[700px] h-[700px] rounded-full blur-[150px] orb-a ${
          isDark ? "bg-orange-500/[0.04]" : "bg-orange-400/[0.08]"
        }`} />
        <div className={`absolute bottom-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] orb-b ${
          isDark ? "bg-orange-600/[0.03]" : "bg-orange-300/[0.06]"
        }`} />
        <div className={`absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full blur-[100px] orb-c ${
          isDark ? "bg-amber-500/[0.025]" : "bg-amber-400/[0.05]"
        }`} />
      </div>

      <div className={`relative z-10 w-full max-w-[380px] mx-5 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}>

        <div className={`absolute -inset-[1px] rounded-2xl glow-border ${
          isDark
            ? "bg-gradient-to-b from-orange-500/20 via-orange-500/[0.03] to-orange-500/10"
            : "bg-gradient-to-b from-orange-400/25 via-orange-400/[0.05] to-orange-400/15"
        }`} />
        <div className={`absolute inset-0 rounded-2xl backdrop-blur-2xl ${
          isDark ? "bg-white/[0.04]" : "bg-white/70"
        }`} />

        <div className="relative rounded-2xl overflow-hidden">
          <div className="relative px-7 py-8 sm:px-9 sm:py-9">

            <div className={`flex flex-col items-center mb-6 transition-all duration-500 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="relative mb-4 group">
                <div className={`absolute -inset-2.5 rounded-xl blur-lg transition-all duration-500 ${
                  isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/15 group-hover:bg-orange-400/25"
                }`} />
                <div className={`relative w-14 h-14 rounded-xl overflow-hidden p-1.5 ${
                  isDark ? "border border-white/10 bg-white/5" : "border border-orange-200/50 bg-white/80 shadow-sm"
                }`}>
                  <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
                </div>
              </div>
              <h1 className={`text-xl font-bold tracking-tight mb-0.5 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Welcome Back
              </h1>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"}`}>
                Sign in to your dashboard
              </p>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
                isDark
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-red-500/15" : "bg-red-100"
                }`}>
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <span className={`text-xs font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              <div className={`transition-all duration-500 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <label className={`block text-[10px] font-bold mb-1.5 uppercase tracking-[0.15em] ${
                  isDark ? "text-white/35" : "text-gray-500"
                }`}>
                  Email Address
                </label>
                <div className="relative group">
                  <div className={`absolute -inset-[1px] rounded-lg transition-all duration-300 ${
                    focusedField === "email"
                      ? "bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-orange-500/30 opacity-100"
                      : isDark
                        ? "opacity-0 group-hover:opacity-100 bg-white/[0.04]"
                        : "opacity-0 group-hover:opacity-100 bg-orange-400/[0.06]"
                  }`} />
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "email"
                        ? "text-orange-400"
                        : isDark ? "text-white/20" : "text-gray-400"
                    }`}>
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-11 pl-11 pr-4 rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                        isDark
                          ? "bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/15 focus:bg-white/[0.06] focus:border-orange-500/30"
                          : "bg-white/60 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
                      }`}
                      placeholder="admin@tribyte.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-500 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <label className={`block text-[10px] font-bold mb-1.5 uppercase tracking-[0.15em] ${
                  isDark ? "text-white/35" : "text-gray-500"
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <div className={`absolute -inset-[1px] rounded-lg transition-all duration-300 ${
                    focusedField === "password"
                      ? "bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-orange-500/30 opacity-100"
                      : isDark
                        ? "opacity-0 group-hover:opacity-100 bg-white/[0.04]"
                        : "opacity-0 group-hover:opacity-100 bg-orange-400/[0.06]"
                  }`} />
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "password"
                        ? "text-orange-400"
                        : isDark ? "text-white/20" : "text-gray-400"
                    }`}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-11 pl-11 pr-11 rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                        isDark
                          ? "bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/15 focus:bg-white/[0.06] focus:border-orange-500/30"
                          : "bg-white/60 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors focus:outline-none"
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              <div className={`flex items-center transition-all duration-500 delay-[350ms] ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className={`w-4 h-4 rounded-[4px] transition-all flex items-center justify-center peer-checked:border-orange-500 peer-checked:bg-orange-500 ${
                      isDark
                        ? "border border-white/15 bg-white/[0.03]"
                        : "border border-gray-300 bg-white"
                    }`}>
                      <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className={`text-xs transition-colors ${
                    isDark
                      ? "text-white/25 group-hover:text-white/40"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}>
                    Remember me
                  </span>
                </label>
              </div>

              <div className={`pt-0.5 transition-all duration-500 delay-[400ms] ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-11 rounded-lg font-semibold text-sm tracking-wide transition-all duration-300 group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-500 to-orange-500 transition-all duration-300 group-hover:from-orange-600 group-hover:via-orange-500 group-hover:to-amber-400" />
                  <div className="absolute inset-[1px] rounded-[7px] bg-gradient-to-b from-white/15 to-transparent opacity-40" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                  <div className="relative flex items-center justify-center gap-2 text-white">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className={`mt-5 text-center transition-all duration-500 delay-500 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}>
              <p className={`text-[9px] tracking-widest uppercase ${
                isDark ? "text-white/[0.07]" : "text-gray-300"
              }`}>
                © {new Date().getFullYear()} TribyteSolutions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}