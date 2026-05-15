import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

import { getEnv } from "./src/config/env";
import syncNotionHandler from "./api/sync-notion";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase
const supabaseUrl = getEnv("VITE_SUPABASE_URL") || '';
const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("VITE_SUPABASE_ANON_KEY") || '';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is alive!" });
});

app.post("/webhook-kaldev", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const secretToken = getEnv("KALDEV_SECRET_TOKEN");

  // For testing, if secretToken is not set in env, we might want to warn
  if (!secretToken) {
    console.warn("KALDEV_SECRET_TOKEN is not configured in environment variables.");
  }

  if (secretToken && token !== secretToken) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const payload = req.body;
  const { ticket_id, project_name } = payload;

  if (!ticket_id || !project_name) {
    return res.status(400).json({ success: false, error: "ticket_id and project_name are required" });
  }

  try {
    // Perform upsert based on ticket_id
    const { error } = await supabase
      .from('kaldev_projects')
      .upsert({
        ...payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'ticket_id' });

    if (error) throw error;

    return res.status(200).json({ success: true, message: "Data Synced Successfully" });
  } catch (error: any) {
    console.error("Kaldev Webhook Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

app.post("/sync-notion", syncNotionHandler);

async function startServer() {
  const appInstance = express();
  appInstance.use(express.json());
  
  // Routes go FIRST
  appInstance.use("/api", app);

  if (getEnv("NODE_ENV") !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    appInstance.use(vite.middlewares);
  } else {
    appInstance.use(express.static(path.join(process.cwd(), "dist")));
    appInstance.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  appInstance.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
