import { spawn } from "child_process";
import * as v from "valibot";
import { WebSocket, WebSocketServer } from "ws";
import { StartFFmpeg } from "./schemas";

// Create a WebSocket server for signaling
const wss = new WebSocketServer({ port: parseInt(process.env.PORT ?? "5000") });

function startFFmpeg({ streamKey, codec, fps }: v.InferOutput<typeof StartFFmpeg>, ws: WebSocket) {
  const ffmpeg = spawn("ffmpeg", [
    "-fflags",
    "+nobuffer",

    "-i",
    "pipe:0", // Input from stdin

    "-c:v",
    codec.video.startsWith("avc1") || codec.video === "h264" || codec.video === "h.264" ? "copy" : "libx264", // Video codec
    "-c:a",
    codec.audio === "mp4a.40.2" || codec.audio === "aac" ? "copy" : "aac", // Audio codec
    "-preset",
    "ultrafast", // Encoding preset
    "-g",
    `${fps * 2}`, // Keyframe interval
    "-f",
    "flv", // Format

    ...(codec.video.startsWith("avc1") ? [] : ["-filter:v", `fps=${fps}`]), // Output FPS
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
  let data = {
    streamKey: "",
    codec: {
      video: "",
      audio: "",
    },
    fps: 30,
  };

  let ffmpeg: ReturnType<typeof spawn>;

  ws.on("message", (message) => {
    if (!data.streamKey) {
      try {
        data = JSON.parse(message.toString());

        ffmpeg = startFFmpeg(data, ws);
      } catch (error) {
        console.error("Invalid JSON", error);
        ws.close();
      }

      console.log("Starting session with", data.codec, data.fps);

      return;
    }

    ffmpeg?.stdin?.write(message);
  });

  ws.on("close", () => {
    ffmpeg?.stdin?.end();
    console.log(`WebSocket closed`);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    ffmpeg?.stdin?.end();
  });
});
