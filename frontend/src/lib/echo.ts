import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import { api, ensureCsrfCookie } from "./api/client";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<"reverb">;
  }
}

let echoInstance: Echo<"reverb"> | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const authClient = axios.create({
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  if (!key) return null;

  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;

  const host = process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080);
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";

  echoInstance = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel) => ({
      authorize: async (socketId, callback) => {
        try {
          await ensureCsrfCookie();
          const xsrf = api.defaults.headers.common["X-XSRF-TOKEN"];
          const { data } = await authClient.post(
            `${API_URL}/broadcasting/auth`,
            {
              socket_id: socketId,
              channel_name: channel.name,
            },
            {
              headers: xsrf ? { "X-XSRF-TOKEN": xsrf as string } : {},
            },
          );
          callback(null, data);
        } catch (error) {
          callback(error instanceof Error ? error : new Error(String(error)), null);
        }
      },
    }),
  });

  window.Echo = echoInstance;

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
  if (typeof window !== "undefined") {
    delete window.Echo;
  }
}
