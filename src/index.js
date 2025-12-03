import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// static paths
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// Get current file directory for custom static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const customPublicPath = join(__dirname, "..", "public");

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				const isSecure = req.headers['x-forwarded-proto'] === 'https' || 
				                req.connection.encrypted ||
				                req.socket.encrypted;
				
				if (isSecure) {
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				}
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
});

// Register custom static files first (higher priority)
fastify.register(fastifyStatic, {
	root: customPublicPath,
	decorateReply: true,
});

// Fallback to original ultraviolet static files
fastify.register(fastifyStatic, {
	root: publicPath,
	prefix: "/fallback/",
	decorateReply: false,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	// Try custom path first, then fallback
	try {
		return res.sendFile("uv/uv.config.js", customPublicPath);
	} catch {
		return res.sendFile("uv/uv.config.js", publicPath);
	}
});

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/uv/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	fastify.close();
	process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
