/**
 * AudioSynth.js - Procedural sound effects using Web Audio API
 * Generates simple sound effects without loading external audio files
 */

// Create a single AudioContext instance (reused for all sounds)
let audioContext = null

/**
 * Get or create the AudioContext
 * AudioContext must be created after user interaction (browser requirement)
 */
function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        } catch (e) {
            console.warn('Web Audio API not supported:', e)
            return null
        }
    }
    
    // Resume context if suspended (required after user interaction)
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }
    
    return audioContext
}

/**
 * Play a very quiet "Tak" sound when shooting
 * Short, high-pitch click sound with low volume
 */
export function playShootSound() {
    const ctx = getAudioContext()
    if (!ctx) return

    // Create oscillator for the "Tak" sound
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect: oscillator -> gain -> destination
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Configure oscillator: short square wave burst
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(2000, ctx.currentTime) // High pitch (2kHz)
    
    // Envelope: very short attack and decay
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.001) // Very low volume (0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.02) // Quick decay
    gainNode.gain.linearRampToValueAtTime(0, now + 0.05) // Fade out

    // Play the sound
    oscillator.start(now)
    oscillator.stop(now + 0.05) // Very short duration (50ms)
}

/**
 * Play a satisfying "Pop" sound when hitting a target
 * Bubble wrap style pop - short, crisp, and satisfying
 */
export function playHitSound() {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Main pop oscillator - sine wave with quick frequency drop
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Bubble wrap pop: start very high, drop quickly
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1200, now) // Start high (1200Hz)
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.03) // Drop to 150Hz very quickly (30ms)
    
    // Very quick attack and decay for crisp bubble wrap pop
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.001) // Instant attack, louder (0.5)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03) // Very fast decay
    gainNode.gain.linearRampToValueAtTime(0, now + 0.05) // Quick fade out

    oscillator.start(now)
    oscillator.stop(now + 0.05) // Very short duration (50ms) for crisp pop

    // Add a subtle high-frequency "click" layer for more realism (bubble wrap characteristic)
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()

    clickOsc.connect(clickGain)
    clickGain.connect(ctx.destination)

    clickOsc.type = 'square' // Square wave for sharper click
    clickOsc.frequency.setValueAtTime(3000, now) // High frequency click
    
    clickGain.gain.setValueAtTime(0, now)
    clickGain.gain.linearRampToValueAtTime(0.15, now + 0.0005) // Very quick attack
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.01) // Very fast decay
    clickGain.gain.linearRampToValueAtTime(0, now + 0.02) // Quick fade

    clickOsc.start(now)
    clickOsc.stop(now + 0.02) // Very short click layer
}

