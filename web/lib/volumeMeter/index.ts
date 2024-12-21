/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
    Date: 2024-12-21
    Maintainer: tobycm
    Description: This file is a TypeScript conversion of the original volume-meter.js file.
    GitHub: https://github.com/tobycm

    The original file was written by Chris Wilson and can be found at:
    https://github.com/cwilso/volume-meter/blob/main/volume-meter.js
*/

/*

Usage Example:

const audioContext = new AudioContext();
const meter = await createAudioMeter(audioContext);

// Connect to a source node (e.g., a microphone)
const sourceNode = audioContext.createMediaStreamSource(stream);
sourceNode.connect(meter);

// Read volume levels or check for clipping
setInterval(() => {
  console.log(`Volume: ${meter.parameters.get('volume')}`);
}, 100);


*/

export async function createAudioMeter(audioContext: AudioContext): Promise<AudioWorkletNode> {
  // Load the external processor module
  try {
    await audioContext.audioWorklet.addModule("/volumeMeterProcessor.js");
  } catch (error) {
    throw new Error(`Failed to load AudioWorkletProcessor: ${error}`);
  }

  // Create the AudioWorkletNode
  return new AudioWorkletNode(audioContext, "volumeMeterProcessor");
}

export interface VolumeData {
  volume: number;
  clipping: boolean;
}
