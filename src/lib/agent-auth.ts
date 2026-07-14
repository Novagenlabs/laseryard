import { NextRequest } from "next/server";

/**
 * Auth for endpoints called by the Yara ElevenLabs agent as webhook tools.
 * The shared secret lives in AGENT_TOOL_SECRET here and as a workspace
 * secret in ElevenLabs, sent via the x-agent-secret header.
 */
export function isAuthorizedAgentRequest(request: NextRequest): boolean {
  const secret = process.env.AGENT_TOOL_SECRET;
  return !!secret && request.headers.get("x-agent-secret") === secret;
}
