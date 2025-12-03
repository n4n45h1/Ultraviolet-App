// This file overwrites the stock UV config.js

self.__uv$config = {
  prefix: "/uv/service/",
  encodeUrl: function(str) {
    if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
      return Ultraviolet.codec.xor.encode(str);
    }
    return str;
  },
  decodeUrl: function(str) {
    if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
      return Ultraviolet.codec.xor.decode(str);
    }
    return str;
  },
  handler: "/uv/uv.handler.js",
  client: "/uv/uv.client.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
