import type { GroqStructuredLead } from "@/types/lead";

type MessageGenerationType = "first" | "followup";

type MessageGenerationContext = {
  type: MessageGenerationType;
  idea: {
    name: string;
    description: string;
    target_customer: string;
  };
  lead: {
    name: string;
    role: string | null;
    company: string | null;
    headline: string | null;
  };
  previousMessage?: string;
  daysElapsed?: number;
};

type ReplyInsightExtraction = {
  summary: string;
  pain_points: string[];
  objections: string[];
  current_solution: string[];
  feature_requests: string[];
  buying_signals: string[];
  interest_level: "low" | "medium" | "high";
};

function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Please add GROQ_API_KEY to your environment variables (.env.local)."
    );
  }
  return apiKey;
}

async function requestGroqJson(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getGroqApiKey();
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `Groq API request failed with status ${response.status}: ${
        errText || response.statusText
      }`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq API returned an empty completion message.");
  }

  return content;
}

function extractCleanString(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }
  const cleaned = input.trim();
  return cleaned ? cleaned : null;
}

function validateGeneratedMessage(message: string, maxWords: number): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    throw new Error("Groq returned an empty message. Please try again.");
  }

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length > maxWords) {
    throw new Error(
      `Generated message was too long (${words.length} words). Please try again.`
    );
  }

  if (!/[A-Za-z]/.test(cleaned)) {
    throw new Error("Generated message appears invalid. Please try again.");
  }

  if (words.length < 8) {
    throw new Error("Generated message was too short to be useful. Please try again.");
  }

  const punctuationRatio =
    (cleaned.match(/[^A-Za-z0-9\s]/g)?.length ?? 0) / Math.max(cleaned.length, 1);
  if (punctuationRatio > 0.25) {
    throw new Error("Generated message appears malformed. Please try again.");
  }

  return cleaned;
}

export async function parseLinkedInProfileWithGroq(
  rawProfileText: string
): Promise<GroqStructuredLead> {
  const systemPrompt = `You are a strict data extraction assistant specializing in LinkedIn profile parsing.
Analyze the raw text pasted by a user and determine if it is a valid LinkedIn profile or professional profile for an individual person.

Return ONLY a JSON object with:
- "is_valid_profile": boolean (true ONLY if the text is an individual's LinkedIn or professional profile; false if text is random webpage content, article, generic text, code, or non-profile content)
- "name": full name of the person if clearly present in the text, else null (DO NOT invent, guess, or assume a name if not explicitly stated)
- "role": current or primary job title / role if present, else null
- "company": current or primary company / organization if present, else null
- "headline": LinkedIn headline or summary tagline if present, else null

Format response strictly as valid JSON without markdown wrapping or commentary.`;

  const userPrompt = `Raw Profile Content:\n\n${rawProfileText}`;
  const content = await requestGroqJson(systemPrompt, userPrompt);

  let parsed: {
    is_valid_profile?: boolean;
    name?: string | null;
    role?: string | null;
    company?: string | null;
    headline?: string | null;
  };

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse structured JSON from Groq API output.");
  }

  const isValidProfile = Boolean(parsed.is_valid_profile);
  const name =
    typeof parsed.name === "string" &&
    parsed.name.trim() &&
    parsed.name.trim() !== "Unknown Lead"
      ? parsed.name.trim()
      : null;
  const role = typeof parsed.role === "string" && parsed.role.trim() ? parsed.role.trim() : null;
  const company =
    typeof parsed.company === "string" && parsed.company.trim() ? parsed.company.trim() : null;
  const headline =
    typeof parsed.headline === "string" && parsed.headline.trim() ? parsed.headline.trim() : null;

  if (!isValidProfile || !name || (!role && !company && !headline)) {
    throw new Error("Couldn't detect a LinkedIn profile in this text — please check your paste.");
  }

  return {
    name,
    role,
    company,
    headline,
  };
}

export async function generateOutreachMessageWithGroq(
  context: MessageGenerationContext
): Promise<string> {
  const maxWords = 90;
  const systemPrompt = `You write concise LinkedIn outreach messages for founder idea validation.
Rules:
- Return ONLY JSON: {"message":"..."} with a single message string.
- Keep the message under ${maxWords} words.
- Friendly, respectful, human tone.
- No hard selling, no pitch deck language, no urgency tricks.
- Ask for insight and learning, not a sales call.
- Avoid repetitive phrasing and avoid sounding automated.
- Use plain English and keep it easy to copy/paste.
- Do not include markdown, bullets, or quotes around the full message.`;

  if (context.type === "followup" && !context.previousMessage) {
    throw new Error("Missing previous outgoing message for follow-up generation.");
  }

  const followupSection =
    context.type === "followup"
      ? `\nYou previously reached out with this message: ${context.previousMessage}
It's been ${context.daysElapsed ?? 0} days with no reply.
Write a brief, polite follow-up that doesn't repeat the same question, acknowledges you're following up, and stays low-pressure.`
      : "\nWrite a first outreach message asking for perspective and insight on the problem space.";

  const userPrompt = `Idea context:
- Name: ${context.idea.name}
- Description: ${context.idea.description}
- Target customer: ${context.idea.target_customer}

Lead profile:
- Name: ${context.lead.name}
- Role: ${context.lead.role ?? "Unknown"}
- Company: ${context.lead.company ?? "Unknown"}
- Headline: ${context.lead.headline ?? "Unknown"}${followupSection}`;

  const content = await requestGroqJson(systemPrompt, userPrompt);

  let parsed: { message?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse generated message from Groq.");
  }

  const message = extractCleanString(parsed.message);
  if (!message) {
    throw new Error("Groq returned an invalid message payload. Please try again.");
  }

  return validateGeneratedMessage(message, maxWords);
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function extractReplyInsightWithGroq(
  rawReplyText: string
): Promise<ReplyInsightExtraction> {
  const cleanedReply = rawReplyText.trim();
  if (!cleanedReply) {
    throw new Error("Reply text cannot be empty.");
  }
  if (cleanedReply.length < 12) {
    throw new Error("Reply text is too short to extract meaningful insight.");
  }

  const systemPrompt = `You extract structured insight from a pasted reply message.
Return ONLY JSON with keys:
- summary: string
- pain_points: string[]
- objections: string[]
- current_solution: string[]
- feature_requests: string[]
- buying_signals: string[]
- interest_level: "low" | "medium" | "high"

Rules:
- Do not invent facts not present in the reply.
- Keep summary concise (1-2 sentences).
- If a field is unknown, return an empty array (or a careful summary for summary).
- Interest level must be one of low, medium, high.
- No markdown, no prose outside JSON.`;

  const userPrompt = `Reply text:\n\n${cleanedReply}`;
  const content = await requestGroqJson(systemPrompt, userPrompt);

  let parsed: {
    summary?: unknown;
    pain_points?: unknown;
    objections?: unknown;
    current_solution?: unknown;
    feature_requests?: unknown;
    buying_signals?: unknown;
    interest_level?: unknown;
  };

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse structured insight from Groq.");
  }

  const summary = extractCleanString(parsed.summary);
  const painPoints = normalizeStringArray(parsed.pain_points);
  const objections = normalizeStringArray(parsed.objections);
  const currentSolution = normalizeStringArray(parsed.current_solution);
  const featureRequests = normalizeStringArray(parsed.feature_requests);
  const buyingSignals = normalizeStringArray(parsed.buying_signals);
  const interestLevel = extractCleanString(parsed.interest_level);

  if (!summary || summary.length < 10) {
    throw new Error("Extracted summary looked invalid. Please paste a clearer reply.");
  }

  if (!interestLevel || !["low", "medium", "high"].includes(interestLevel)) {
    throw new Error("Extracted interest level was invalid. Please try again.");
  }

  if (
    painPoints.length === 0 &&
    objections.length === 0 &&
    currentSolution.length === 0 &&
    featureRequests.length === 0 &&
    buyingSignals.length === 0
  ) {
    throw new Error("Reply did not contain enough signal to extract insight.");
  }

  return {
    summary,
    pain_points: painPoints,
    objections,
    current_solution: currentSolution,
    feature_requests: featureRequests,
    buying_signals: buyingSignals,
    interest_level: interestLevel as "low" | "medium" | "high",
  };
}
