import {
  GOOGLE_STORAGE_SVACC_KEY,
  GOOGLE_STORAGE_SVCACC_EMAIL,
} from "$lib/envProvider";
import { Storage } from "@google-cloud/storage";

// Read-Write access to cloud storage buckets
export const storageRW = new Storage({
  projectId: "ps-g15",
  credentials: {
    "type": "service_account",
    "client_email": GOOGLE_STORAGE_SVCACC_EMAIL,
    "private_key": GOOGLE_STORAGE_SVACC_KEY,
  },
});
