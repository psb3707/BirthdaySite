"use client"

import { useEffect, useState } from "react"
import { Heart, Sparkles, Star } from "lucide-react"

interface CelebrationEffectProps {
  onComplete: () => void
}

export default function CelebrationEffect({ onComplete }: CelebrationEffectProps) {
  const [showCelebration, setShowCelebration] = useState(true)
  const [showFireworks, setShowFireworks] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [showText, setShowText] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowFireworks(true), 200)
    const timer2 = setTimeout(() => setShowHearts(true), 800)
    const timer3 = setTimeout(() => setShowText(true), 1500)
    const timer4 = setTimeout(() => setFadeOut(true), 4000)
    const timer5 = setTimeout(() => {
      setShowCelebration(false)
      onComplete()
    }, 5500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [onComplete])

  if (!showCelebration) return null

  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-romantic-sky via-romantic-pink-light to-romantic-gold transition-opacity duration-1500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Fireworks */}
      {showFireworks && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-firework"
              style={{
                left: `${20 + (i * 7)}%`,
                top: `${15 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              <div className="firework-explosion">
                {[...Array(8)].map((_, j) => (
                  <div
                    key={j}
                    className="firework-particle"
                    style={{
                      transform: `rotate(${j * 45}deg)`,
                      backgroundColor: [
                        '#FF6B9D', '#FFD93D', '#6BCF7F', '#4D96FF', '#9B59B6', '#FF8C42'
                      ][Math.floor(Math.random() * 6)],
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Hearts */}
      {showHearts && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Heart 
                className="text-romantic-pink-deep fill-current opacity-80" 
                size={20 + Math.random() * 20} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Sparkles */}
      {showHearts && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-sparkle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <Sparkles 
                className="text-romantic-gold opacity-70" 
                size={12 + Math.random() * 16} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Stars */}
      {showHearts && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <Star 
                className="text-romantic-cream fill-current" 
                size={8 + Math.random() * 12} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Celebration Text */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-celebration-text">
            <div className="mb-8">
              <h1 className="text-7xl lg:text-8xl font-bold text-white mb-4 animate-bounce-in font-serif">
                500일
              </h1>
              <div className="text-4xl lg:text-5xl font-bold text-romantic-cream animate-slide-up font-korean">
                축하해! 🎉
              </div>
            </div>
            <div className="text-xl lg:text-2xl text-white/90 animate-fade-in-up font-korean max-w-md mx-auto leading-relaxed">
              우리가 함께한 소중한 500일!
              <br />
              매일매일이 특별했어 💕
            </div>
            <div className="mt-8 text-lg text-white/80 animate-pulse font-korean">
              잠시만 기다려줘...
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>

      <style jsx>{`
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        @keyframes sparkle-float {
          0% { transform: translateY(0) rotate(0deg) scale(0); opacity: 0; }
          10% { opacity: 1; transform: scale(1); }
          50% { transform: translateY(-20px) rotate(180deg) scale(1.2); }
          100% { transform: translateY(-40px) rotate(360deg) scale(0); opacity: 0; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(-90deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes slide-up {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes fade-in-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-firework {
          animation: firework 2s ease-out forwards;
        }

        .animate-float-up {
          animation: float-up 4s ease-out forwards;
        }

        .animate-sparkle-float {
          animation: sparkle-float 3s ease-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-celebration-text {
          animation: fade-in-up 1.2s ease-out forwards;
        }

        .firework-explosion {
          position: relative;
          width: 4px;
          height: 4px;
        }

        .firework-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: explode 1s ease-out forwards;
        }

        @keyframes explode {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}