import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/utils/database/supabase_server";

const requestSchema = z.object({
  targetUrl: z.string(),
  title: z.string().optional(),
  body: z.string().optional(),
  fid: z.number().optional(), // Make FID optional
});

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  // Get notification recipients
  let query = supabase
    .from('notifications')
    .select('fid, token, callback_url');

  // Only filter by FID if one is provided
  if (requestBody.data.fid) {
    query = query.eq('fid', requestBody.data.fid);
  }

  const { data: recipients, error: dbError } = await query;

  if (dbError) {
    console.error('Error fetching notification details:', dbError);
    return Response.json(
      { success: false, error: 'Failed to fetch notification details' },
      { status: 500 }
    );
  }

  if (!recipients || recipients.length === 0) {
    return Response.json(
      { success: false, error: 'No notification recipients found' },
      { status: 404 }
    );
  }

  // Send notifications to all recipients
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const response = await fetch(recipient.callback_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: crypto.randomUUID(),
            title: requestBody.data.title || "Gnars DAO Update",
            body: requestBody.data.body || "There's new activity in the Gnars DAO!",
            targetUrl: requestBody.data.targetUrl,
            tokens: [recipient.token],
          } satisfies SendNotificationRequest),
        });

        const responseJson = await response.json();
        const responseBody = sendNotificationResponseSchema.safeParse(responseJson);

        if (!responseBody.success) {
          return { fid: recipient.fid, status: "error", error: responseBody.error.errors };
        }

        if (responseBody.data.result.rateLimitedTokens.length) {
          return { fid: recipient.fid, status: "rate_limited" };
        }

        return { fid: recipient.fid, status: "success" };
      } catch (error) {
        return { 
          fid: recipient.fid, 
          status: "error", 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
      }
    })
  );

  const successCount = results.filter(r => r.status === "success").length;
  const rateLimitedCount = results.filter(r => r.status === "rate_limited").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return Response.json({
    success: true,
    summary: {
      total: results.length,
      successful: successCount,
      rateLimited: rateLimitedCount,
      failed: errorCount
    },
    details: results
  });
}