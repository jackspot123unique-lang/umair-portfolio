import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { errorJson,trustedOrigin } from "@/lib/request";
import { bucket,r2 } from "@/lib/storage";
import { abortInput } from "@/lib/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){if(!trustedOrigin(request))return errorJson("Invalid request origin.",403);try{await requireAdmin();const value=abortInput.parse(await request.json());await r2().send(new AbortMultipartUploadCommand({Bucket:bucket(),Key:value.key,UploadId:value.uploadId}));return Response.json({ok:true});}catch(e){if(e instanceof Error&&e.message==="UNAUTHORIZED")return errorJson("Admin sign-in is required.",401);return errorJson("Could not cancel multipart upload.",400);}}
