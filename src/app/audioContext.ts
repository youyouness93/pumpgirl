class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  initialize() {
    if (!this.isInitialized) {
      this.audio = new Audio('/The Adventures of Star Saver OST - Stage 1.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.5;
      this.isInitialized = true;
    }
  }

  play() {
    if (this.audio) {
      // Store the play promise
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay fails, add a one-time click listener
          const handleClick = () => {
            this.audio?.play();
            document.removeEventListener('click', handleClick);
          };
          document.addEventListener('click', handleClick);
        });
      }
    }
  }

  toggleMute() {
    if (this.audio) {
      this.audio.muted = !this.audio.muted;
      return this.audio.muted;
    }
    return false;
  }

  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
      this.isInitialized = false;
    }
  }
}

export const audioManager = AudioManager.getInstance();
