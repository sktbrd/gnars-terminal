import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/utils/database/supabase_server";
import { fetchProposals } from "@/app/services/proposal";
import { DAO_ADDRESSES } from "@/utils/constants";

const requestSchema = z.object({
  proposalNumber: z.number().optional(),
  fid: z.number().optional(),
  event: z.object({
    data: z.object({
      block: z.object({
        timestamp: z.number(),
      }).required(),
    }).required(),
  }).required(),
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

  // Fetch the latest proposal with retries
  async function fetchProposalWithRetry(timestamp: number, maxRetries = 4): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      const latestProposals = await fetchProposals(
        DAO_ADDRESSES.token,
        'proposalNumber',
        'desc',
        1
      );

      if (!latestProposals || latestProposals.length === 0) {
        if (i === maxRetries - 1) {
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }

      const proposal = latestProposals[0];
      if (Math.abs(Number(proposal.timeCreated) - timestamp) <= 60) { // Allow 60 seconds difference
        return proposal;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  }

  const blockTimestamp = requestBody.data.event.data.block.timestamp;
  const latestProposal = await fetchProposalWithRetry(blockTimestamp);

  if (!latestProposal) {
    return Response.json(
      { success: false, error: 'No matching proposal found after retries' },
      { status: 404 }
    );
  }

  const proposalUrl = `${process.env.NEXT_PUBLIC_URL}/dao/proposal/${latestProposal.proposalNumber}`;

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
            title: "New Gnars DAO Proposal",
            body: `Proposal #${latestProposal.proposalNumber}: ${latestProposal.title || 'New proposal'}`,
            targetUrl: proposalUrl,
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