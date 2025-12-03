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
  if (!navigator.serviceWorker) {
    throw new Error("Your browser doesn't support service workers.");
  }

  if (
    location.protocol !== "https:" &&
    !swAllowedHostnames.includes(location.hostname) &&
    !location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)
  ) {
    throw new Error("Service workers cannot be registered without https. Use localhost or an IP address.");
  }

  try {
    const registration = await navigator.serviceWorker.register(stockSW);
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    throw err;
  }
}
