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
        const safeName = escape(data.name);
        const safeEmail = escape(data.email);
        const safeSubject = escape(cleanSubject || "No subject");
        const safeMessage = escape(data.message).replace(/\n/g, "<br>");

        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_TO_EMAIL],
          replyTo: data.email,
          subject: emailSubject,
          text: plainText,
          html: `
            <div style="margin:0;padding:32px 16px;background:#eef4f8;font-family:Arial,Helvetica,sans-serif;color:#2c3e50">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:680px;margin:0 auto;border-collapse:separate">
                <tr>
                  <td style="background:#1a2e4a;border-radius:16px 16px 0 0;padding:28px 34px">
                    <div style="font-size:10px;letter-spacing:2px;font-weight:700;color:#8bd2c4;text-transform:uppercase">Umair Ahmad Portfolio</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#ffffff;margin:10px 0 0">New <span style="color:#55b8e9;font-style:italic">Message</span></div>
                    <div style="width:42px;height:3px;background:#16a085;border-radius:3px;margin-top:16px"></div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ffffff;padding:30px 34px;border-left:1px solid #dbe7ef;border-right:1px solid #dbe7ef">
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#5e6e78">You have received a new enquiry through your portfolio contact form.</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;border:1px solid #dbe7ef;border-radius:10px;overflow:hidden">
                      <tr>
                        <td style="width:120px;padding:12px 14px;background:#f4f8fb;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #dbe7ef">Name</td>
                        <td style="padding:12px 14px;color:#1a2e4a;font-size:14px;font-weight:700;border-bottom:1px solid #dbe7ef">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="width:120px;padding:12px 14px;background:#f4f8fb;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #dbe7ef">Email</td>
                        <td style="padding:12px 14px;border-bottom:1px solid #dbe7ef"><a href="mailto:${safeEmail}" style="color:#2980b9;text-decoration:none;font-size:14px;font-weight:700">${safeEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="width:120px;padding:12px 14px;background:#f4f8fb;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase">Subject</td>
                        <td style="padding:12px 14px;color:#1a2e4a;font-size:14px;font-weight:700">${safeSubject}</td>
                      </tr>
                    </table>
                    <div style="margin-top:22px;padding:18px 20px;background:#f7fbfa;border-left:4px solid #16a085;border-radius:0 8px 8px 0">
                      <div style="font-size:11px;letter-spacing:1px;font-weight:700;color:#16a085;text-transform:uppercase;margin-bottom:10px">Message</div>
                      <div style="font-size:14px;line-height:1.75;color:#2c3e50">${safeMessage}</div>
                    </div>
                    <div style="margin-top:24px">
                      <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${cleanSubject || "Your Portfolio Message"}`)}" style="display:inline-block;padding:12px 20px;background:#2980b9;border-radius:7px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700">Reply to ${safeName}</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#dbe7ef;border-radius:0 0 16px 16px;padding:18px 34px;color:#5e6e78;font-size:11px;line-height:1.6">
                    This message was sent from the contact form on Umair Ahmad's portfolio website. Use the Reply button or your email client's Reply action to respond directly to ${safeName}.
                  </td>
                </tr>
              </table>
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
