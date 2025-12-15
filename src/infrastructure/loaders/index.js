import { loadGLTF } from "./loaders/gltf.js";
import { loadOBJ } from "./loaders/obj.js";
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
