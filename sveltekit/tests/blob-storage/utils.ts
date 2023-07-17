import {
  BLOBAllowedFileTypes,
  LogicConstraints,
} from "$lib/services/constraints";
import type { FSJetpack } from "fs-jetpack/types";

// export async function compareBlobs(blob1: Blob, blob2: Blob) {
//   const b1 = Buffer.from(await blob1.arrayBuffer())
//   const b2 = Buffer.from(await blob2.arrayBuffer())

//   if (b1.length !== b2.length) {
//     return false;
//   }

//   for (let i = 0; i < b1.length; i++) {
//     if (b1[i] !== b2[i]) {
//       return false;
//     }
//   }

//   return true;
// }

export async function getBlobFromFile(
  parentDirectory: FSJetpack,
  fileName: string,
  fileType?: keyof typeof BLOBAllowedFileTypes,
): Promise<Blob> {
  const buffer = await parentDirectory.readAsync(fileName, "buffer");
  if (!buffer) {
    throw Error("File not found");
  }
  const blob: Blob = new Blob([buffer], {
    type: fileType !== undefined
      ? BLOBAllowedFileTypes[fileType].type
      : LogicConstraints.Posts.EXTENSION_TO_FILE_TYPE(fileName),
  });
  return blob;
}

export function getBlobFromObject(
  obj: object,
  fileType: keyof typeof BLOBAllowedFileTypes,
): Blob {
  const blob: Blob = new Blob([JSON.stringify(obj)], {
    type: BLOBAllowedFileTypes[fileType].type,
  });
  return blob;
}
