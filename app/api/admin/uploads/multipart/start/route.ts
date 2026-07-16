import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { clientIp,errorJson,trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { bucket,keyFor,publicUrl,r2 } from "@/lib/storage";
import { uploadInput } from "@/lib/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){if(!trustedOrigin(request))return errorJson("Invalid request origin.",403);try{await requireAdmin();const rate=await limit("upload",clientIp(request));if(!rate.allowed)return errorJson("Too many upload requests.",429,{retryAfter:rate.retryAfter});const file=uploadInput.parse(await request.json()),key=keyFor(file.fileName),created=await r2().send(new CreateMultipartUploadCommand({Bucket:bucket(),Key:key,ContentType:file.contentType}));if(!created.UploadId)throw new Error("No multipart upload ID.");return Response.json({key,uploadId:created.UploadId,publicUrl:publicUrl(key)});}catch(e){if(e instanceof Error&&e.message==="UNAUTHORIZED")return errorJson("Admin sign-in is required.",401);console.error(e);return errorJson("Could not start multipart upload.",400);}}
