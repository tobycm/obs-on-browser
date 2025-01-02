import { resolutions } from "./common";

export class VideoStartEvent extends Event {
  stream: MediaStream;

  constructor(stream: MediaStream) {
    super("videoStart");
    this.stream = stream;
  }
}

export class StopSourceEvent extends Event {
  id: string;

  constructor(id: string) {
    super("stopSource");
    this.id = id;
  }
}

export class ResolutionChangeEvent extends Event {
  name: keyof typeof resolutions;
  value: (typeof resolutions)[keyof typeof resolutions];

  constructor(resolution: keyof typeof resolutions) {
    super("resolutionChange");
    this.name = resolution;
    this.value = resolutions[resolution];
  }
}

export class FPSChangeEvent extends Event {
  value: number;

  constructor(fps: number) {
    super("fpsChange");
    this.value = fps;
  }
}

export interface Events {
  resolutionChange: ResolutionChangeEvent;
  fpsChange: FPSChangeEvent;

  clearAllSources: Event;

  recordingStart: Event;
  recordingStop: Event;
  liveStart: Event;
  liveStop: Event;

  videoStart: VideoStartEvent;
  videoStop: Event;

  newSource: Event;
  stopSource: StopSourceEvent;
}