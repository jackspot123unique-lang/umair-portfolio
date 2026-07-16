import { NextRequest } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { clientIp, errorJson, ipHash, trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { contactInput } from "@/lib/validation";
export const runtime = "nodejs";
const escape = (value: string) => value.replace(/[&<>'"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[c] || c);
export async function POST(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.", 403);
  const ip = clientIp(request), rate = await limit("contact", ip);
  if (!rate.allowed) return errorJson("Too many messages. Please try again later.", 429, { retryAfter: rate.retryAfter });
  try {
    const data = contactInput.parse(await request.json());
    if (data.website) return Response.json({ ok: true }); // silent honeypot success
    await prisma.contactMessage.create({ data: { name: data.name, email: data.email, subject: data.subject || null, message: data.message, ipHash: ipHash(ip) } });
    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
      try {
        await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.CONTACT_FROM_EMAIL, to: [process.env.CONTACT_TO_EMAIL], replyTo: data.email, subject: data.subject ? `Portfolio: ${data.subject}` : `Portfolio message from ${data.name}`, html: `<h2>New portfolio message</h2><p><b>From:</b> ${escape(data.name)} &lt;${escape(data.email)}&gt;</p><p><b>Subject:</b> ${escape(data.subject || "No subject")}</p><p>${escape(data.message).replace(/\n/g,"<br>")}</p>` });
      } catch (mailError) { console.error("Resend delivery failed", mailError); }
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) { console.error("Contact error", e); return errorJson("Message could not be sent. Please try again or use the email address above.", 400); }
}
