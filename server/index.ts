import { spawn } from "child_process";
import { WebSocket, WebSocketServer } from "ws";

// Create a WebSocket server for signaling
const wss = new WebSocketServer({ port: 5000 });

function startFFmpeg({ streamKey, fps }: { streamKey: string; fps: number }, ws: WebSocket) {
  const ffmpeg = spawn("ffmpeg", [
    // "-loglevel",
    // "debug",

    // "-f",
    // "webm",

    "-fflags",
    "+nobuffer",

    // "-probesize",
    // "512K",
    // "-analyzeduration",
    // "2M",

    "-i",
    "pipe:0", // Input from stdin

    // "-map",
    // "0", // Map all streams

    // "-map",
    // "0:a", // Map audio

    // "-map",
    // "0:v", // Map video

    "-c:v",
    "libx264", // Video codec
    "-c:a",
    "aac", // Audio codec
    "-preset",
    "ultrafast", // Encoding preset
    "-g",
    `${fps * 2}`, // Keyframe interval
    "-f",
    "flv", // Format
    "-filter:v",
    `fps=${fps}`, // Output FPS
    `rtmp://live.twitch.tv/app/${streamKey}`, // Output URL
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`.replace(streamKey, "STREAM_KEY"));
    if (ws.readyState !== ws.OPEN) return;
    ws.send(`${data}`);
  });

  ffmpeg.on("close", (code) => {
    ws.send(`FFmpeg child process exited with code ${code}`);
    console.log(`FFmpeg child process exited with code ${code}`);
    ws.close();
  });

  return ffmpeg;
}

wss.on("connection", (ws) => {
  const data = {
    streamKey: "",
    fps: 30,
  };

  let ffmpeg: ReturnType<typeof spawn>;

  // let chunks: Buffer[] = [];

  ws.on("message", (message) => {
    if (!data.streamKey) {
      try {
        const { streamKey, fps } = JSON.parse(message.toString());
        data.streamKey = streamKey;
        data.fps = fps;

        ffmpeg = startFFmpeg(data, ws);
      } catch (error) {
        console.error("Invalid JSON", error);
        ws.close();
      }
      return;
    }

    // chunks.push(message as Buffer);

    ffmpeg?.stdin?.write(message);
    // console.log(`WebSocket message: ${message.length}`);
  });

  ws.on("close", () => {
    ffmpeg?.stdin?.end();
    console.log(`WebSocket closed`);

    // writeFileSync("video.webm", Buffer.concat(chunks));
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    ffmpeg?.stdin?.end();

    // writeFileSync("video.webm", Buffer.concat(chunks));
  });
});
