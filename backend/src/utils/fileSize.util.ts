// Note: byteToHumanSizeString is character for character identical to the one
// in frontend/src/utils/fileSize.util.ts. Copied rather than shared, so a fix here
// does not reach the other one.

export function byteToHumanSizeString(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)).toString());
  return (bytes / Math.pow(1000, i)).toFixed(1).toString() + " " + sizes[i];
}
