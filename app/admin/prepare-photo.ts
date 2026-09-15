import { imageSize } from "image-size";

export async function preparePhoto(file: File): Promise<Blob> {
  if (file.size > 20 * 1024 * 1024) throw new Error("This original exceeds 20 MB. Export a smaller photograph and try again.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let dimensions;
  try { dimensions = imageSize(bytes); } catch { throw new Error("The file could not be read as a photograph. Please use JPG, PNG, WebP, HEIC, or HEIF."); }
  if (!dimensions.width || !dimensions.height || [dimensions, ...(dimensions.images || [])].some(d => d.width * d.height > 48_000_000)) throw new Error("This photo exceeds 48 megapixels. Export a smaller version first.");
  const isHeic = ["heic", "heif", "heix", "hevc", "hevx", "mif1", "msf1"].includes(dimensions.type || "");
  if (!["jpg", "png", "webp", "heif", "heic"].includes(dimensions.type || "") && !isHeic) throw new Error("Use a JPG, PNG, WebP, HEIC, or HEIF photo.");
  let source: Blob = file;
  if (isHeic) {
    const { heicTo } = await import("heic-to/csp");
    try { source = await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 }) as Blob; }
    catch { throw new Error("This HEIC could not be converted. On your iPhone, export it as Most Compatible (JPEG), then try again."); }
  }
  const url = URL.createObjectURL(source);
  const image = new Image();
  try {
    image.src = url; await image.decode();
    if (image.naturalWidth * image.naturalHeight > 48_000_000) throw new Error("This image exceeds 48 megapixels.");
    const ratio = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * ratio); canvas.height = Math.round(image.naturalHeight * ratio);
    const context = canvas.getContext("2d"); if (!context) throw new Error("The phone could not prepare this photo. Close other tabs and retry.");
    context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    // Browser decoding applies orientation; canvas export removes EXIF, including GPS.
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    try {
      for (const quality of [0.88, 0.76, 0.64, 0.5]) {
        const result = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (result && result.size <= 3 * 1024 * 1024) return result;
      }
      throw new Error("This photo is still too large. Export a smaller copy and retry.");
    } finally { canvas.width = 1; canvas.height = 1; }
  } finally { URL.revokeObjectURL(url); image.src = ""; }
}
