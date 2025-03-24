import { notificationDetailsSchema } from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/utils/database/supabase_server";

const requestSchema = z.object({
  fid: z.number(),
  notificationDetails: notificationDetailsSchema,
  targetUrl: z.string().optional(),
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

  // Store notification details in Supabase
  const { error: dbError } = await supabase
    .from('notifications')
    .insert({
      fid: requestBody.data.fid,
      token: requestBody.data.notificationDetails.token,
      callback_url: requestBody.data.notificationDetails.url,
      target_url: requestBody.data.targetUrl || process.env.NEXT_PUBLIC_URL || '',
    });

  if (dbError) {
    console.error('Error storing notification details:', dbError);
    return Response.json(
      { success: false, error: 'Failed to store notification details' },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}