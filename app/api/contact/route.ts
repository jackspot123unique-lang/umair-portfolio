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
        const safeName = escape(data.name);
        const safeEmail = escape(data.email);
        const safeSubject = escape(cleanSubject || "No subject");
        const safeMessage = escape(data.message).replace(/\n/g, "<br>");
        const plainText = `Name: ${data.name}\n\nEmail: ${data.email}\n\nSubject: ${cleanSubject || "No subject"}\n\nMessage:\n${data.message}`;

        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_TO_EMAIL],
          replyTo: data.email,
          subject: emailSubject,
          text: plainText,
          html: `
            <div style="margin:0;padding:0;background:#d8e9f7;font-family:Arial,Helvetica,sans-serif;color:#2c3e50">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:#d8e9f7">
                <tr>
                  <td style="padding:42px 5% 48px">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;border-collapse:separate;background:#ffffff;border:1px solid #c6ddea;border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(26,46,74,.12)">
                      <tr>
                        <td style="padding:34px 42px 28px;background:#eef7fd;border-bottom:1px solid #c6ddea">
                          <div style="font-size:10px;letter-spacing:2px;font-weight:700;color:#2980b9;text-transform:uppercase">Portfolio Contact</div>
                          <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;color:#1a2e4a;margin-top:12px;font-weight:700">Engr. Umair Ahmad <span style="color:#7f8c8d;font-size:22px;font-weight:400">|</span> <span style="color:#1a2e4a">Portfolio</span></div>
                          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1.2;color:#1a2e4a;margin-top:14px">New <span style="color:#2980b9;font-style:italic">Message</span></div>
                          <div style="width:48px;height:3px;background:#16a085;border-radius:3px;margin-top:17px"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:30px 42px 36px;background:#ffffff">
                          <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#5e6e78">A new message has arrived through your portfolio website.</p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;border-collapse:separate;border-spacing:0 8px">
                            <tr>
                              <td style="width:135px;padding:13px 15px;background:#eef7fd;border-radius:8px 0 0 8px;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase">Name</td>
                              <td style="padding:13px 15px;background:#f9fcfe;border-radius:0 8px 8px 0;color:#1a2e4a;font-size:15px;font-weight:700">${safeName}</td>
                            </tr>
                            <tr>
                              <td style="width:135px;padding:13px 15px;background:#eef7fd;border-radius:8px 0 0 8px;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase">Email</td>
                              <td style="padding:13px 15px;background:#f9fcfe;border-radius:0 8px 8px 0"><a href="mailto:${safeEmail}" style="color:#2980b9;text-decoration:none;font-size:15px;font-weight:700">${safeEmail}</a></td>
                            </tr>
                            <tr>
                              <td style="width:135px;padding:13px 15px;background:#eef7fd;border-radius:8px 0 0 8px;color:#1a2e4a;font-size:11px;letter-spacing:1px;font-weight:700;text-transform:uppercase">Subject</td>
                              <td style="padding:13px 15px;background:#f9fcfe;border-radius:0 8px 8px 0;color:#1a2e4a;font-size:15px;font-weight:700">${safeSubject}</td>
                            </tr>
                          </table>
                          <div style="margin-top:24px;padding:20px 22px;background:#f1faf8;border:1px solid #ccece5;border-left:4px solid #16a085;border-radius:10px">
                            <div style="font-size:11px;letter-spacing:1px;font-weight:700;color:#16a085;text-transform:uppercase;margin-bottom:11px">Message</div>
                            <div style="font-size:15px;line-height:1.8;color:#2c3e50">${safeMessage}</div>
                          </div>
                          <div style="margin-top:26px">
                            <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${cleanSubject || "Your Portfolio Message"}`)}" style="display:inline-block;padding:13px 22px;background:#2980b9;border-radius:8px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700">Reply to ${safeName}</a>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 42px;background:#e4f0f9;border-top:1px solid #c6ddea;color:#7f8c8d;font-size:11px;line-height:1.65">This message was sent from the contact form on Engr. Umair Ahmad's portfolio. Use Reply to respond directly to ${safeName}.</td>
                      </tr>
                    </table>
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
