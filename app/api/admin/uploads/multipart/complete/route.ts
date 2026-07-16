import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { errorJson,trustedOrigin } from "@/lib/request";
import { bucket,publicUrl,r2 } from "@/lib/storage";
import { completeInput } from "@/lib/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){if(!trustedOrigin(request))return errorJson("Invalid request origin.",403);try{await requireAdmin();const value=completeInput.parse(await request.json());const done=await r2().send(new CompleteMultipartUploadCommand({Bucket:bucket(),Key:value.key,UploadId:value.uploadId,MultipartUpload:{Parts:value.parts.sort((a,b)=>a.PartNumber-b.PartNumber)}}));if(!done.ETag)throw new Error("R2 did not confirm completion.");return Response.json({key:value.key,publicUrl:publicUrl(value.key)});}catch(e){if(e instanceof Error&&e.message==="UNAUTHORIZED")return errorJson("Admin sign-in is required.",401);console.error(e);return errorJson("Could not complete multipart upload.",400);}}
