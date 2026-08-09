"use client"

import { useEffect, useRef } from "react"
import type { NetworkNode } from "@/lib/types"

const STATUS_HSL: Record<string, string> = {
  online: "150 60% 55%",
  syncing: "195 55% 55%",
  degraded: "85 60% 55%",
  offline: "20 65% 50%",
}

interface P {
  x: number
  y: number
  vx: number
  vy: number
  node: NetworkNode
}

export function Topology({ nodes }: { nodes: NetworkNode[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let particles: P[] = []
    let width = 0
    let height = 0

    const setup = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = nodesRef.current.map((node, i) => {
        const angle = (i / nodesRef.current.length) * Math.PI * 2
        const r = Math.min(width, height) * (0.18 + (i % 3) * 0.12)
        return {
          x: width / 2 + Math.cos(angle) * r,
          y: height / 2 + Math.sin(angle) * r,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          node,
        }
      })
    }

    setup()
    const onResize = () => setup()
    window.addEventListener("resize", onResize)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Keep particle node data in sync (for status/load color)
      particles.forEach((p, i) => {
        p.node = nodesRef.current[i] ?? p.node
        p.x += p.vx
        p.y += p.vy
        if (p.x < 20 || p.x > width - 20) p.vx *= -1
        if (p.y < 20 || p.y > height - 20) p.vy *= -1
      })

      // Links between nearby active nodes
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        if (a.node.status === "offline") continue
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          if (b.node.status === "offline") continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.35
            ctx.strokeStyle = `hsl(150 40% 50% / ${alpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Nodes
      particles.forEach((p) => {
        const hsl = STATUS_HSL[p.node.status]
        const size = 2.5 + (p.node.role === "validator" ? 3 : p.node.role === "storage" ? 2 : 1)
        // glow
        ctx.beginPath()
        ctx.fillStyle = `hsl(${hsl} / 0.15)`
        ctx.arc(p.x, p.y, size + 5, 0, Math.PI * 2)
        ctx.fill()
        // core
        ctx.beginPath()
        ctx.fillStyle = `hsl(${hsl})`
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
        // validator ring
        if (p.node.role === "validator") {
          ctx.beginPath()
          ctx.strokeStyle = `hsl(${hsl} / 0.6)`
          ctx.lineWidth = 0.8
          ctx.arc(p.x, p.y, size + 3, 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div className="relative h-full min-h-[260px] w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Network topology visualization" />
      <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
        <Legend color="150 60% 55%" label="online" />
        <Legend color="195 55% 55%" label="syncing" />
        <Legend color="85 60% 55%" label="degraded" />
        <Legend color="20 65% 50%" label="offline" />
        <span className="text-muted/70">◦ validator = ringed</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="size-2 rounded-full" style={{ background: `hsl(${color})` }} />
      {label}
    </span>
  )
}
