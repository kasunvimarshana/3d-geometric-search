(function () {
  var global = typeof window !== "undefined" ? window : this;
  function attachProvider(provider) {
    try {
      var conv = provider && provider();
      if (typeof conv === "function") {
        global.STEP_CONVERTER = conv;
        console.info("[STEP] Converter attached via provider");
      }
    } catch (e) {
      console.warn("[STEP] Provider attach failed:", e);
    }
  }
  if (typeof global.STEP_CONVERTER_PROVIDER === "function") {
    attachProvider(global.STEP_CONVERTER_PROVIDER);
  }
  var url = global.STEP_CONVERTER_URL;
  if (typeof url === "string" && url.length) {
    var s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = function () {
      if (typeof global.STEP_CONVERTER_PROVIDER === "function") {
        attachProvider(global.STEP_CONVERTER_PROVIDER);
      }
    };
    s.onerror = function () {
      console.warn("[STEP] Failed to load converter script:", url);
    };
    document.head.appendChild(s);
  }
})();
