import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { clientIp, errorJson, trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { bucket, keyFor, publicUrl, r2 } from "@/lib/storage";
import { uploadInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.",403);
  try {
    await requireAdmin(); const rate=await limit("upload",clientIp(request)); if(!rate.allowed)return errorJson("Too many upload requests.",429,{retryAfter:rate.retryAfter});
    const file=uploadInput.parse(await request.json()), key=keyFor(file.fileName);
    const uploadUrl=await getSignedUrl(r2(),new PutObjectCommand({Bucket:bucket(),Key:key,ContentType:file.contentType}),{expiresIn:300});
    return Response.json({uploadUrl,key,publicUrl:publicUrl(key),expiresIn:300});
  } catch(e) { if(e instanceof Error&&e.message==="UNAUTHORIZED")return errorJson("Admin sign-in is required.",401); console.error(e); return errorJson("Could not prepare the cloud upload.",400); }
}
