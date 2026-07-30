import { NextRequest } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { clientIp, errorJson, ipHash, trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { contactInput } from "@/lib/validation";

export const runtime = "nodejs";

const escape = (value: string) => value.replace(/[&<'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character] || character);

export async function POST(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.", 403);
  const ip = clientIp(request);
  const rate = await limit("contact", ip);
  if (!rate.allowed) return errorJson("Too many messages. Please try again later.", 429, { retryAfter: rate.retryAfter });

  try {
    const data = contactInput.parse(await request.json());
    if (data.website) return Response.json({ ok: true });

    await prisma.contactMessage.create({
      data: { name: data.name, email: data.email, subject: data.subject || null, message: data.message, ipHash: ipHash(ip) },
    });

    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
      try {
        const cleanSubject = data.subject.trim();
        const emailSubject = cleanSubject
          ? `Portfolio Message — ${cleanSubject}`
          : `New Portfolio Message from ${data.name}`;
        const plainText = `Name: ${data.name}\n\nEmail: ${data.email}\n\nSubject: ${cleanSubject || "No subject"}\n\nMessage:\n${data.message}`;

        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_TO_EMAIL],
          replyTo: data.email,
          subject: emailSubject,
          text: plainText,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:680px;color:#1a2e4a">
              <h2 style="margin:0 0 18px;color:#1a2e4a">New Portfolio Message</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:10px 12px;background:#eef4f8;font-weight:700;width:120px">Name</td><td style="padding:10px 12px;border:1px solid #dbe7ef">${escape(data.name)}</td></tr>
                <tr><td style="padding:10px 12px;background:#eef4f8;font-weight:700">Email</td><td style="padding:10px 12px;border:1px solid #dbe7ef"><a href="mailto:${escape(data.email)}" style="color:#2980b9">${escape(data.email)}</a></td></tr>
                <tr><td style="padding:10px 12px;background:#eef4f8;font-weight:700">Subject</td><td style="padding:10px 12px;border:1px solid #dbe7ef">${escape(cleanSubject || "No subject")}</td></tr>
              </table>
              <div style="margin-top:18px;padding:14px;border-left:4px solid #16a085;background:#f7fbfa;white-space:pre-wrap;line-height:1.65"><strong>Message</strong><br><br>${escape(data.message)}</div>
              <p style="margin-top:18px;color:#7f8c8d;font-size:12px">Use Reply to respond directly to ${escape(data.name)}.</p>
            </div>`,
        });
      } catch (mailError) {
        console.error("Resend delivery failed", mailError);
      }
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Contact error", error);
    return errorJson("Message could not be sent. Please try again or use the email address above.", 400);
  }
}
