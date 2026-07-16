import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { clientIp,errorJson,trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { bucket,r2 } from "@/lib/storage";
import { partInput } from "@/lib/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){if(!trustedOrigin(request))return errorJson("Invalid request origin.",403);try{await requireAdmin();const rate=await limit("upload",clientIp(request));if(!rate.allowed)return errorJson("Too many upload requests.",429,{retryAfter:rate.retryAfter});const value=partInput.parse(await request.json());const uploadUrl=await getSignedUrl(r2(),new UploadPartCommand({Bucket:bucket(),Key:value.key,UploadId:value.uploadId,PartNumber:value.partNumber}),{expiresIn:300});return Response.json({uploadUrl,expiresIn:300});}catch(e){if(e instanceof Error&&e.message==="UNAUTHORIZED")return errorJson("Admin sign-in is required.",401);return errorJson("Could not prepare upload part.",400);}}
