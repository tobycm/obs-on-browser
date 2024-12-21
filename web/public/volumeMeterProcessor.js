class VolumeMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.volume = 0;
    this.clipping = false;
    this.lastClip = 0;
    this.clipLevel = 0.98;
    this.averaging = 0.95;
    this.clipLag = 750;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelData = input[0];
    const bufferLength = channelData.length;
    let sum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const sample = channelData[i];
      if (Math.abs(sample) >= this.clipLevel) {
        this.clipping = true;
        this.lastClip = currentTime * 1000; // Convert to milliseconds
      }
      sum += sample * sample;
    }

    const rms = Math.sqrt(sum / bufferLength);
    this.volume = Math.max(rms, this.volume * this.averaging);

    // Send volume to main thread
    this.port.postMessage({
      volume: this.volume,
      clipping: this.clipping,
    });

    return true; // Keep processor running
  }

  checkClipping() {
    if (!this.clipping) return false;
    if (this.lastClip + this.clipLag < currentTime * 1000) {
      this.clipping = false;
    }
    return this.clipping;
  }

  static get parameterDescriptors() {
    return [];
  }
}

registerProcessor("volumeMeterProcessor", VolumeMeterProcessor);
