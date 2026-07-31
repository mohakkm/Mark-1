import type { GroqStructuredLead } from "@/types/lead";

export async function parseLinkedInProfileWithGroq(
  rawProfileText: string
): Promise<GroqStructuredLead> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Please add GROQ_API_KEY to your environment variables (.env.local)."
    );
  }

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
      temperature: 0.1,
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
    typeof parsed.name === "string" && parsed.name.trim() && parsed.name.trim() !== "Unknown Lead"
      ? parsed.name.trim()
      : null;
  const role = typeof parsed.role === "string" && parsed.role.trim() ? parsed.role.trim() : null;
  const company = typeof parsed.company === "string" && parsed.company.trim() ? parsed.company.trim() : null;
  const headline = typeof parsed.headline === "string" && parsed.headline.trim() ? parsed.headline.trim() : null;

  // Reject if Groq marked as invalid, or name is missing, or no professional metadata fields exist
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
