import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const HeroBackground = ({ 
    variant = 'default',
    intensity = 'medium',
    interactive = true 
}) => {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse tracking
    const springConfig = { damping: 20, stiffness: 150 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);
    const interactiveX = useTransform(smoothMouseX, [-0.5, 0.5], [-20, 20]);
    const interactiveY = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);

    // Intensity multipliers
    const intensityMap = {
        low: { blur: 2, opacity: 0.5, movement: 10 },
        medium: { blur: 3, opacity: 0.7, movement: 20 },
        high: { blur: 4, opacity: 1, movement: 30 }
    };

    const currentIntensity = intensityMap[intensity];

    // Track mouse movement for interactive mode
    useEffect(() => {
        if (!interactive) return;

        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [interactive, mouseX, mouseY]);

    // Variant configurations
    const variants = {
        default: {
            shapes: [
                { color: 'green-500', size: '72', top: '-24', left: '-24', blur: '3xl' },
                { color: 'emerald-400', size: '80', top: '1/3', right: '-20', blur: '3xl' },
                { color: 'red-500', size: '96', bottom: '-28', left: '1/3', blur: '3xl' },
            ],
            gradient: 'radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)'
        },
        food: {
            shapes: [
                { color: 'green-500', size: '64', top: '-16', left: '-16', blur: '2xl', emoji: '🍕' },
                { color: 'emerald-400', size: '72', top: '1/4', right: '-12', blur: '2xl', emoji: '🍔' },
                { color: 'red-500', size: '80', bottom: '-20', left: '1/4', blur: '2xl', emoji: '🍣' },
                { color: 'yellow-400', size: '56', top: '2/3', right: '1/3', blur: '2xl', emoji: '🍜' },
            ],
            gradient: 'radial-gradient(circle_at_center,rgba(249,115,22,0.05),transparent_70%)'
        },
        minimal: {
            shapes: [
                { color: 'slate-200', size: '64', top: '-16', left: '-16', blur: '2xl' },
                { color: 'slate-300', size: '72', bottom: '-20', right: '-12', blur: '2xl' },
            ],
            gradient: 'linear-gradient(145deg, rgba(249,115,22,0.02) 0%, transparent 100%)'
        }
    };

    const currentVariant = variants[variant];

    // Generate random floating animations for each shape
    const getFloatingAnimation = (index) => ({
        x: [0, Math.sin(index) * currentIntensity.movement, 0],
        y: [0, Math.cos(index) * currentIntensity.movement * 0.7, 0],
        scale: [1, 1.02, 1],
        rotate: [0, Math.sin(index) * 2, 0],
        transition: {
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
        }
    });

    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ willChange: 'transform' }}
        >
            {/* Background Gradient Base */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-transparent 
                           dark:from-green-950/20 dark:via-emerald-950/10 dark:to-transparent"
            />

            {/* Animated Blobs */}
            {currentVariant.shapes.map((shape, index) => {
                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                            top: shape.top,
                            left: shape.left,
                            right: shape.right,
                            bottom: shape.bottom,
                            x: interactive ? interactiveX : 0,
                            y: interactive ? interactiveY : 0,
                            willChange: 'transform',
                        }}
                    >
                        <motion.div
                            className={`
                                relative w-${shape.size} h-${shape.size} 
                                rounded-full bg-${shape.color}/20 dark:bg-${shape.color}/10
                                backdrop-blur-${shape.blur || '3xl'}
                            `}
                            animate={getFloatingAnimation(index)}
                            style={{
                                filter: `blur(${currentIntensity.blur}px)`,
                                opacity: currentIntensity.opacity,
                            }}
                        >
                            {/* Optional emoji overlay for food variant */}
                            {shape.emoji && variant === 'food' && (
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center text-4xl opacity-30"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {shape.emoji}
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                );
            })}

            {/* Floating Particles */}
            {variant !== 'minimal' && (
                <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute w-1 h-1 bg-green-500/30 rounded-full"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, Math.random() * 20 - 10, 0],
                                opacity: [0, 0.5, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Animated Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #f97316 1px, transparent 1px),
                        linear-gradient(to bottom, #f97316 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    mask: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
                }}
            />

            {/* Radial Gradient Overlay */}
            <div 
                className="absolute inset-0"
                style={{
                    background: currentVariant.gradient,
                    mixBlendMode: 'overlay'
                }}
            />

            {/* Vignette Effect */}
            <div 
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.1) 100%)',
                    pointerEvents: 'none'
                }}
            />

            {/* Noise Texture (Optional) */}
            <div 
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px',
                }}
            />
        </div>
    );
};

export default HeroBackground;
