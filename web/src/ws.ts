export default class TobyWebSocket extends WebSocket {
  constructor({
    url = "ws://localhost:5000",
    open = () => {},
    message = (message: MessageEvent) => {
      console.log(message);
    },
    close = () => {
      console.log("WebSocket closed");
    },
    error = (error: Event) => {
      console.error(error);
    },
  }: {
    url?: string;
    open?: (event: Event) => void;
    message?: (message: MessageEvent) => void;
    close?: (event: CloseEvent) => void;
    error?: (error: Event) => void;
  } = {}) {
    super(url);

    this.addEventListener("open", open);
    this.addEventListener("message", message);
    this.addEventListener("close", close);
    this.addEventListener("error", error);
  }
}

export const TobyWebSocketAsync = (...options: ConstructorParameters<typeof TobyWebSocket>) =>
  new Promise<TobyWebSocket>((resolve, reject) => {
    try {
      const newWs = new TobyWebSocket(...options);
      newWs.addEventListener("open", () => resolve(newWs));
    } catch (error) {
      reject(error);
    }
  });
