"use strict";
/**
 * Distributed with Ultraviolet and compatible with most configurations.
 */
const stockSW = "/uv/sw.js";

/**
 * List of hostnames that are allowed to run serviceworkers on http://
 */
const swAllowedHostnames = ["localhost", "127.0.0.1"];

/**
 * Global util
 * Used in 404.html and index.html
 */
async function registerSW() {
  console.log("Service Worker registration attempt:");
  console.log("  - navigator.serviceWorker exists:", !!navigator.serviceWorker);
  console.log("  - isSecureContext:", window.isSecureContext);
  console.log("  - location.protocol:", location.protocol);
  console.log("  - location.hostname:", location.hostname);
  
  if (!navigator.serviceWorker) {
    const msg = "Your browser doesn't support service workers.";
    console.error(msg);
    throw new Error(msg);
  }

  // Check if we're on a secure context or allowed hostname
  const isLocalhost = swAllowedHostnames.includes(location.hostname);
  const isIPAddress = location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
  const isSecure = location.protocol === "https:" || window.isSecureContext;

  console.log("  - isLocalhost:", isLocalhost);
  console.log("  - isIPAddress:", isIPAddress);
  console.log("  - isSecure:", isSecure);

  if (!isSecure && !isLocalhost && !isIPAddress) {
    const msg = "Service workers require HTTPS, localhost, or IP address.";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    console.log("Attempting to register Service Worker at:", stockSW);
    const registration = await navigator.serviceWorker.register(stockSW);
    console.log("✓ Service Worker registered successfully:", registration);
    return registration;
  } catch (error) {
    console.error("✗ Service Worker registration failed:", error);
    throw error;
  }
}
