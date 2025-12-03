import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

import { getSupabaseAdmin } from "../src/lib/supabase";

async function initStorage() {
    const supabase = getSupabaseAdmin();
    const bucketName = "product-images";

    console.log(`Checking storage bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const bucketExists = buckets.find((b) => b.name === bucketName);

    if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists.`);
    } else {
        console.log(`Creating bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 1024 * 1024 * 5, // 5MB
            allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
        });

        if (error) {
            console.error("Error creating bucket:", error);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    }
}

initStorage();
