const mimeTypes = [
  "video/webm; codecs=avc1.42E01E, mp4a.40.2",
  "video/webm; codecs=avc1.42E01E, aac",
  "video/webm; codecs=avc1.42E01E, opus",
  "video/webm; codecs=h264, mp4a.40.2",
  "video/webm; codecs=h264, aac",
  "video/webm; codecs=h264, opus",
  "video/webm; codecs=h.264, mp4a.40.2",
  "video/webm; codecs=h.264, aac",
  "video/webm; codecs=h.264, opus",
  "video/webm; codecs=av1, mp4a.40.2",
  "video/webm; codecs=av1, aac",
  "video/webm; codecs=av1, opus",
  "video/webm; codecs=h.265, mp4a.40.2",
  "video/webm; codecs=h.265, aac",
  "video/webm; codecs=h.265, opus",
  "video/webm; codecs=vp9, mp4a.40.2",
  "video/webm; codecs=vp9, aac",
  "video/webm; codecs=vp9, opus",
  "video/webm; codecs=vp8, mp4a.40.2",
  "video/webm; codecs=vp8, aac",
  "video/webm; codecs=vp8, opus",
];

export const mimeType = mimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? "video/webm; codecs=vp8, opus";

console.log(`Best mimeType: ${mimeType}`);

export function parseCodec(mimeType: string): { video: string; audio: string } {
  const entries = mimeType
    .split(";")
    .map((entry) => entry.trim())
    .map((entry) => entry.split("="));
  const codec = entries.find(([key]) => key === "codecs")?.[1] ?? "";

  if (!codec) throw new Error("Invalid codec");

  const [video, audio] = codec.split(",");

  return { video, audio };
}
