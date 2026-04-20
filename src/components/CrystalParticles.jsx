import { useEffect, useRef } from 'react'

const CrystalParticles = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId
        let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let particles = []
        let width = window.innerWidth
        let height = window.innerHeight
        let dpr = Math.min(window.devicePixelRatio || 1, 2)

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            canvas.width = Math.floor(width * dpr)
            canvas.height = Math.floor(height * dpr)
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        window.addEventListener('resize', resize)
        resize()

        const palette = [
            { dot: '58, 117, 150', glow: '128, 192, 215' },
            { dot: '22, 66, 91', glow: '72, 143, 177' },
            { dot: '197, 160, 89', glow: '255, 230, 176' },
        ]

        const getParticleCount = () => {
            const area = width * height
            return Math.max(42, Math.min(110, Math.floor(area / 19000)))
        }

        class Particle {
            constructor() {
                this.reset()
            }

            reset() {
                this.x = Math.random() * width
                this.y = Math.random() * height
                this.vx = (Math.random() - 0.5) * 0.28
                this.vy = (Math.random() - 0.5) * 0.28 - 0.05
                this.size = Math.random() * 2.2 + 0.9
                this.baseOpacity = Math.random() * 0.42 + 0.18
                this.phase = Math.random() * Math.PI * 2
                this.color = palette[Math.floor(Math.random() * palette.length)]
            }

            update() {
                if (reducedMotion) return

                this.phase += 0.012
                this.x += this.vx
                this.y += this.vy

                if (this.x < -20) this.x = width + 20
                if (this.x > width + 20) this.x = -20
                if (this.y < -20) this.y = height + 20
                if (this.y > height + 20) this.y = -20
            }

            draw() {
                const opacity = this.baseOpacity + Math.sin(this.phase) * 0.12

                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.shadowBlur = 16
                ctx.shadowColor = `rgba(${this.color.glow}, 0.36)`
                ctx.fillStyle = `rgba(${this.color.dot}, ${opacity})`
                ctx.fill()

                ctx.beginPath()
                ctx.arc(this.x, this.y, Math.max(0.5, this.size * 0.38), 0, Math.PI * 2)
                ctx.shadowBlur = 0
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.75, opacity + 0.18)})`
                ctx.fill()
            }
        }

        for (let i = 0; i < getParticleCount(); i++) {
            particles.push(new Particle())
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)

            particles.forEach(p => {
                p.update()
                p.draw()
            })

            ctx.shadowBlur = 0
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 145) {
                        const strength = 1 - distance / 145
                        ctx.beginPath()
                        ctx.lineWidth = strength * 0.9
                        ctx.strokeStyle = `rgba(22, 66, 91, ${strength * 0.12})`
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handleMotionPreference = (event) => {
            reducedMotion = event.matches
        }
        motionQuery.addEventListener('change', handleMotionPreference)

        return () => {
            window.removeEventListener('resize', resize)
            motionQuery.removeEventListener('change', handleMotionPreference)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="crystal-particles"
            aria-hidden="true"
        />
    )
}

export default CrystalParticles
