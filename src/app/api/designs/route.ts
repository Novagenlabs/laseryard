import { NextRequest } from "next/server";
import { adminJson, adminPreflight, isAdminRequest } from "@/lib/admin-auth";
import {
  ALLOWED_DESIGN_TYPES,
  MAX_DESIGN_BYTES,
  saveDesign,
} from "@/lib/designs";

export function OPTIONS() {
  return adminPreflight();
}

// Admin: upload order artwork (multipart form, field "file").
// curl -X POST https://laseryard.com/api/designs \
//   -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
//   -F "file=@card.svg"
// Returns { id, url } — pass url as designUrl when creating the order.
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return adminJson({ error: "Unauthorized" }, 401);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return adminJson({ error: "Send the artwork as a form field named 'file'" }, 400);
    }
    if (!ALLOWED_DESIGN_TYPES[file.type]) {
      return adminJson(
        { error: `Unsupported type ${file.type || "unknown"}. Allowed: SVG, PNG, JPEG, WebP` },
        415
      );
    }
    if (file.size > MAX_DESIGN_BYTES) {
      return adminJson({ error: "File too large (max 2MB)" }, 413);
    }

    const data = Buffer.from(await file.arrayBuffer());
    const id = await saveDesign(file.name || `design${ALLOWED_DESIGN_TYPES[file.type]}`, file.type, data);

    return adminJson({ id, url: `/api/designs/${id}` }, 201);
  } catch (e) {
    console.error("Design upload error:", e);
    return adminJson({ error: "Failed to upload design" }, 500);
  }
}
