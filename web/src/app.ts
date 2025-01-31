import { TypedEventTarget } from "typescript-event-target";
import * as v from "valibot";
import { StartFFmpeg } from "../../server/schemas";
import { resolutions } from "./common";
import { Events } from "./events";
import { mimeTypes } from "./mime";
import TobyWebSocket from "./ws";

export class App extends TypedEventTarget<Events> {
  videoSettings: {
    quality: (typeof resolutions)[keyof typeof resolutions];
    fps: number;
  } = {
    quality: resolutions["720p"],
    fps: 30,
  };

  settings: {
    useSameEncoder: boolean;
    customRelay: string;
    streamKey: string;
    destination: v.InferOutput<typeof StartFFmpeg>["destination"];
  } = {
    useSameEncoder: false,
    customRelay: "wss://obb-relay.tobycm.dev",
    streamKey: "",
    destination: "twitch",
  };

  state: {
    recording: boolean;
    live: boolean;
  } = {
    recording: false,
    live: false,
  };

  ws?: TobyWebSocket;

  e = {
    // common elements
    video: document.getElementById("stream") as HTMLVideoElement,
    volumeMeter: document.getElementById("volumeMeter") as HTMLProgressElement,
    record: document.getElementById("record") as HTMLButtonElement,
    goLive: document.getElementById("goLive") as HTMLButtonElement,
    addSource: document.getElementById("addSource") as HTMLButtonElement,
    clearAllSources: document.getElementById("clearAllSources") as HTMLButtonElement,
    source: document.getElementById("source") as HTMLSelectElement,
    error: document.getElementById("error") as HTMLSpanElement,
  };

  video?: MediaStream;
  audioContext?: AudioContext;
  audioInputs = 0;
  audioDestination?: MediaStreamAudioDestinationNode;

  mediaRecorder?: MediaRecorder;
  _recordingBuffer: Blob[] = [];

  bestMime = mimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? "video/webm; codecs=vp8, opus";

  constructor() {
    super();

    console.debug(`Best mimeType: ${this.bestMime}`);
  }

  on: TypedEventTarget<Events>["addEventListener"] = this.addEventListener.bind(this);
  off: TypedEventTarget<Events>["removeEventListener"] = this.removeEventListener.bind(this);

  emit(...args: Parameters<TypedEventTarget<Events>["dispatchTypedEvent"]>): boolean {
    console.debug("Emitting event:", ...args);

    return this.dispatchTypedEvent(...args);
  }
}

const app = new App();

export default app;
