import { spawn } from "child_process";
import { WebSocketServer } from "ws";
("ws");

const stream_key = "live_740590509_SWYhQksclL51cYA4V3gM4Den9zbIF6";

const twitch_rtmp_url = `rtmp://live.twitch.tv/app/${stream_key}`;

// Create a WebSocket server for signaling
const wss = new WebSocketServer({ port: 5000 });

wss.on("connection", (ws) => {
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    "pipe:0", // Input from stdin
    "-c:v",
    "libx264", // Video codec
    "-c:a",
    "aac", // Audio codec
    "-preset",
    "ultrafast", // Encoding preset
    "-g",
    "60", // Keyframe interval
    "-f",
    "flv", // Format
    twitch_rtmp_url, // Output URL
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg child process exited with code ${code}`);
  });

  ws.on("message", (data) => {
    ffmpeg.stdin.write(data);
  });

  ws.on("close", () => {
    ffmpeg.stdin.end();
    console.log("WebSocket closed, stopped streaming to Twitch");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    ffmpeg.stdin.end();
  });
});
