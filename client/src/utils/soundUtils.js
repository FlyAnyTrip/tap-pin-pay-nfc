// Sound utility functions with custom audio file support

export const playBeepSound = () => {
  try {
    // Use custom success.mp3 file from public folder
    const audio = new Audio("/success.mp3")
    audio.volume = 0.5 // Set volume to 50%
    audio.play().catch((error) => {
      console.log("Error playing custom sound, falling back to generated beep:", error)
      // Fallback to generated beep if file doesn't exist
      playGeneratedBeep()
    })
  } catch (error) {
    console.log("Audio file not supported, using generated beep")
    playGeneratedBeep()
  }
}

export const playSuccessSound = () => {
  try {
    // Use custom success.mp3 file for success sound too
    const audio = new Audio("/success.mp3")
    audio.volume = 0.7 // Slightly louder for success
    audio.play().catch((error) => {
      console.log("Error playing custom success sound, falling back to generated sound:", error)
      // Fallback to generated success sound if file doesn't exist
      playGeneratedSuccessSound()
    })
  } catch (error) {
    console.log("Audio file not supported, using generated success sound")
    playGeneratedSuccessSound()
  }
}

// Fallback function for generated beep (original code)
const playGeneratedBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log("Generated audio not supported")
  }
}

// Fallback function for generated success sound (original code)
const playGeneratedSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Play a sequence of notes for success
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      const startTime = audioContext.currentTime + index * 0.15
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  } catch (error) {
    console.log("Generated audio not supported")
  }
}

// Additional utility function to preload audio
export const preloadAudio = () => {
  try {
    const audio = new Audio("/success.mp3")
    audio.preload = "auto"
    console.log("✅ Custom audio file preloaded")
  } catch (error) {
    console.log("Could not preload custom audio file")
  }
}
