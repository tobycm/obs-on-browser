import * as v from "valibot";

export const Codec = v.object({
  video: v.pipe(v.string(), v.minLength(1), v.maxLength(1024)),
  audio: v.pipe(v.string(), v.minLength(1), v.maxLength(1024)),
});

export const StartFFmpeg = v.object({
  streamKey: v.pipe(v.string(), v.minLength(1), v.maxLength(2048)),
  codec: Codec,
  fps: v.pipe(v.number(), v.minValue(1), v.maxValue(60)),
});
