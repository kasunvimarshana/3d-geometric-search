import { loadGLTF } from "./loaders/gltf.js";
import { loadOBJ, loadOBJWithMTL } from "./loaders/obj.js";
import { loadSTL } from "./loaders/stl.js";
import { loadSTEP } from "./loaders/step.js";

export async function loadAnyModel(file) {
  const name = file.name || "model";
  const ext = (name.split(".").pop() || "").toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const modelId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  switch (ext) {
    case "glb":
    case "gltf":
      if (ext === "gltf") {
        const text = new TextDecoder().decode(arrayBuffer);
        return { modelId, ...(await loadGLTF(text, name)) };
      }
      return { modelId, ...(await loadGLTF(arrayBuffer, name)) };
    case "obj":
      return { modelId, ...(await loadOBJ(arrayBuffer, name)) };
    case "stl":
      return { modelId, ...(await loadSTL(arrayBuffer, name)) };
    case "step":
    case "stp":
      return { modelId, ...(await loadSTEP(arrayBuffer, name)) };
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

// Load from multiple files (drag-and-drop or multi-select). Supports OBJ+MTL (+textures) pairing.
export async function loadAnyModelFromFiles(files) {
  const list = Array.from(files || []);
  if (!list.length) throw new Error("No files provided");

  // If only one, fallback to single-file loader.
  if (list.length === 1) {
    return loadAnyModel(list[0]);
  }

  // Group by extension
  const byExt = list.reduce((acc, f) => {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    (acc[ext] ||= []).push(f);
    return acc;
  }, {});

  if (byExt.obj && byExt.obj.length) {
    const objFile = byExt.obj[0];
    const base = objFile.name.replace(/\.[^.]+$/, "");
    const mtlFile =
      (byExt.mtl || []).find((f) => f.name.replace(/\.[^.]+$/, "") === base) ||
      (byExt.mtl || [])[0];

    const textureExts = new Set([
      "png",
      "jpg",
      "jpeg",
      "gif",
      "bmp",
      "webp",
      "tga",
      "ktx2",
      "dds",
    ]);
    const textures = list.filter((f) =>
      textureExts.has((f.name.split(".").pop() || "").toLowerCase())
    );
    const textureURLMap = new Map();
    for (const tf of textures) {
      const url = URL.createObjectURL(tf);
      textureURLMap.set(tf.name.toLowerCase(), url);
    }

    const modelId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const objText = new TextDecoder().decode(await objFile.arrayBuffer());
    if (mtlFile) {
      const mtlText = new TextDecoder().decode(await mtlFile.arrayBuffer());
      const { rootObject } = await loadOBJWithMTL(
        objText,
        mtlText,
        objFile.name,
        textureURLMap
      );
      try {
        rootObject.userData.__blobUrls = Array.from(textureURLMap.values());
      } catch {}
      return { modelId, rootObject };
    } else {
      // No MTL found; load geometry only.
      const { rootObject } = await (async () => {
        const loaderResult = await loadOBJ(
          await objFile.arrayBuffer(),
          objFile.name
        );
        return loaderResult;
      })();
      return { modelId, rootObject };
    }
  }

  // Multi-file glTF: .gltf + .bin + textures
  if (byExt.gltf && byExt.gltf.length) {
    const gltfFile = byExt.gltf[0];
    const relatedExts = new Set([
      "bin",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "bmp",
      "webp",
      "tga",
      "ktx2",
      "dds",
    ]);
    const related = list.filter((f) =>
      relatedExts.has((f.name.split(".").pop() || "").toLowerCase())
    );
    const urlMap = new Map();
    for (const f of related) urlMap.set(f.name, URL.createObjectURL(f));

    const { LoadingManager } = await import("three");
    const manager = new LoadingManager();
    manager.setURLModifier((url) => {
      const base = url.split(/[\\/]/).pop();
      return urlMap.get(base) || url;
    });

    const modelId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const text = new TextDecoder().decode(await gltfFile.arrayBuffer());
    const { rootObject } = await loadGLTF(text, gltfFile.name, manager);
    try {
      rootObject.userData.__blobUrls = Array.from(urlMap.values());
    } catch {}
    return { modelId, rootObject };
  }

  // Fall back: try first supported file
  const preferredOrder = ["glb", "gltf", "stl", "step", "stp"]; // choose a likely candidate
  for (const ext of preferredOrder) {
    if (byExt[ext] && byExt[ext].length) {
      return loadAnyModel(byExt[ext][0]);
    }
  }

  // Otherwise just use the first file
  return loadAnyModel(list[0]);
}
