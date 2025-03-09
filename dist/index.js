// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userTypes = ["founder", "investor", "advisor", "ecosystem_partner"];
var startupStages = ["idea", "mvp", "scaling", "series_a_plus"];
var challenges = ["fundraising", "hiring", "new_markets", "scaling_ops"];
var industries = ["saas", "fintech", "healthtech", "ecommerce", "ai_ml", "other"];
var eventFormats = ["dinner", "roundtable", "mentorship"];
var attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  userType: text("user_type", { enum: userTypes }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  responses: jsonb("responses").notNull(),
  groupId: integer("group_id")
});
var groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  format: text("format", { enum: eventFormats }).notNull(),
  locked: text("locked").default("false")
});
var insertAttendeeSchema = createInsertSchema(attendees).extend({
  responses: z.object({
    startupStage: z.enum(startupStages).optional(),
    challenge: z.enum(challenges).optional(),
    industry: z.enum(industries),
    preferredFormat: z.enum(eventFormats)
  })
}).omit({ id: true, groupId: true });
var insertGroupSchema = createInsertSchema(groups).omit({ id: true, locked: true });

// server/storage.ts
var mockNames = [
  "Sarah Chen",
  "Michael Rodriguez",
  "Emma Thompson",
  "David Kim",
  "Priya Patel",
  "James Wilson",
  "Lisa Zhang",
  "Alex Johnson",
  "Maria Garcia",
  "Tom Anderson",
  "Ava Williams",
  "Ryan Taylor",
  "Sophie Martin",
  "Daniel Lee",
  "Rachel Brown",
  "Chris Davis"
];
var mockEmails = (name) => `${name.toLowerCase().replace(" ", ".")}@example.com`;
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
var MemStorage = class {
  attendees;
  groups;
  attendeeId;
  groupId;
  constructor() {
    this.attendees = /* @__PURE__ */ new Map();
    this.groups = /* @__PURE__ */ new Map();
    this.attendeeId = 1;
    this.groupId = 1;
    this.generateMockData();
  }
  generateMockData() {
    mockNames.forEach((name) => {
      const mockAttendee = {
        name,
        email: mockEmails(name),
        userType: getRandomElement(userTypes),
        responses: {
          startupStage: getRandomElement(startupStages),
          challenge: getRandomElement(challenges),
          industry: getRandomElement(industries),
          preferredFormat: getRandomElement(eventFormats)
        }
      };
      this.createAttendee(mockAttendee);
    });
    const mockGroupNames = [
      "SaaS Founders Dinner",
      "FinTech Roundtable",
      "AI/ML Mentorship Circle",
      "HealthTech Innovation Dinner"
    ];
    mockGroupNames.forEach((name) => {
      const mockGroup = {
        name,
        format: getRandomElement(eventFormats)
      };
      this.createGroup(mockGroup);
    });
  }
  async createAttendee(attendee) {
    const id = this.attendeeId++;
    const newAttendee = { ...attendee, id, groupId: null };
    this.attendees.set(id, newAttendee);
    return newAttendee;
  }
  async getAttendees() {
    return Array.from(this.attendees.values());
  }
  async createGroup(group) {
    const id = this.groupId++;
    const newGroup = { ...group, id, locked: "false" };
    this.groups.set(id, newGroup);
    return newGroup;
  }
  async getGroups() {
    return Array.from(this.groups.values());
  }
  async assignToGroup(attendeeId, groupId) {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) throw new Error("Attendee not found");
    const group = this.groups.get(groupId);
    if (!group) throw new Error("Group not found");
    this.attendees.set(attendeeId, { ...attendee, groupId });
  }
  async lockGroup(groupId) {
    const group = this.groups.get(groupId);
    if (!group) throw new Error("Group not found");
    this.groups.set(groupId, { ...group, locked: "true" });
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/attendees", async (req, res) => {
    try {
      const attendee = insertAttendeeSchema.parse(req.body);
      const created = await storage.createAttendee(attendee);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid attendee data" });
    }
  });
  app2.get("/api/attendees", async (_req, res) => {
    const attendees2 = await storage.getAttendees();
    res.json(attendees2);
  });
  app2.post("/api/groups", async (req, res) => {
    try {
      const group = insertGroupSchema.parse(req.body);
      const created = await storage.createGroup(group);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });
  app2.get("/api/groups", async (_req, res) => {
    const groups2 = await storage.getGroups();
    res.json(groups2);
  });
  app2.post("/api/groups/:groupId/assign/:attendeeId", async (req, res) => {
    try {
      await storage.assignToGroup(
        parseInt(req.params.attendeeId),
        parseInt(req.params.groupId)
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to assign attendee to group" });
    }
  });
  app2.post("/api/groups/:groupId/lock", async (req, res) => {
    try {
      await storage.lockGroup(parseInt(req.params.groupId));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to lock group" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  base: "/Founders-Mesh/"
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
