import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import https from "node:https";

// static paths
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// Get current file directory for custom static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const customPublicPath = join(__dirname, "..", "public");

// Koyeb死活監視 - 5分ごとにPingを送信してスリープを防止
if (process.env.KOYEB_DEPLOYMENT || process.env.ENABLE_MONITOR === 'true') {
	const MONITOR_URL = 'https://sliply.koyeb.app';
	const PING_INTERVAL = 2 * 60 * 1000; // 5分
	
	const sendPing = () => {
		const startTime = Date.now();
		https.get(MONITOR_URL, (res) => {
			const responseTime = Date.now() - startTime;
			console.log(`[Monitor] Ping成功: ${MONITOR_URL} (${res.statusCode}) - ${responseTime}ms`);
		}).on('error', (err) => {
			console.error(`[Monitor] Pingエラー: ${err.message}`);
		});
	};
	
	console.log(`[Monitor] 死活監視開始: ${MONITOR_URL} (間隔: ${PING_INTERVAL / 1000}秒)`);
	sendPing(); // 即座に1回実行
	setInterval(sendPing, PING_INTERVAL); // 定期実行
}

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
