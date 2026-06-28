import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Dhandho AI — /api/chat
//
// This route powers the chat UI. It drives a multi-turn consultation flow
// that collects business context over several messages and then produces a
// structured automation recommendation + ROI estimate.
//
// The conversation flow has three stages:
//   1. ANALYSIS   – gather business type, team size, biggest bottleneck
//   2. SOLUTION   – suggest tool stack, dig into specifics
//   3. ROI        – estimate hours saved, cost savings, and ROI %
//
// If GEMINI_API_KEY is set, responses are powered by Google Gemini 1.5 Flash.
// Otherwise the route falls back to a deterministic rule-based mock so the
// UI is always functional during local development.
// ---------------------------------------------------------------------------

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SYSTEM_PROMPT = `You are Dhandho AI, a concise expert business-automation consultant.
Your job: ask targeted questions to understand the user's business and operational pain points,
then recommend specific automation tools and workflows, and estimate ROI.

Keep replies short (2-5 sentences). Be direct and practical. Do NOT use markdown headers.
After 2–3 exchanges understanding their situation, pivot to concrete recommendations.
When you have enough information, end your reply with exactly this JSON block on its own line:
{"status":"success","recommended_tool":"<Tool Name>","solution_summary":"<one sentence>","tool_recommendations":[{"tool_name":"<name>","description":"<one line>"}],"roi_metrics":{"hours_saved_monthly":<number>,"cost_savings_monthly":<number>,"roi_percentage":<number>}}

Until you have enough info, end each reply with:
{"status":"conversational","reply":"<your full response>"}`;

// ── Simple mock fallback ────────────────────────────────────────────────────

const MOCK_CONVERSATION = [
  {
    trigger: /hello|hi|hey|start/i,
    reply:
      "Welcome! Tell me about your business — what industry are you in, and what's your biggest operational headache right now?",
  },
  {
    trigger: /ecommerce|e-commerce|shop|store|retail/i,
    reply:
      "Got it — ecommerce. Is your biggest pain in order management, customer support, inventory tracking, or something else? And roughly how large is your team?",
  },
  {
    trigger: /support|customer|ticket|email/i,
    reply:
      "Customer support bottlenecks are very common and very fixable. How many support tickets or queries do you handle per day, and are you currently using any helpdesk tool?",
  },
  {
    trigger: /invoice|billing|finance|payment/i,
    reply:
      "Finance automation has huge ROI. Are you manually creating invoices, chasing payments, or both? And what accounting software do you use today?",
  },
];

function mockResponse(message, history) {
  // After 3+ user messages, return a recommendation
  const userMessageCount = history.filter((m) => m.role === 'user').length;

  if (userMessageCount >= 2) {
    return {
      status: 'success',
      recommended_tool: 'Zapier + HubSpot + QuickBooks',
      solution_summary:
        'Automate your lead follow-up, invoice generation, and customer support triage with a connected tool stack.',
      tool_recommendations: [
        {
          tool_name: 'Zapier',
          description:
            'Connect all your apps and automate repetitive data-entry tasks without code.',
        },
        {
          tool_name: 'HubSpot CRM',
          description:
            'Centralize customer data and automate follow-up sequences so no lead goes cold.',
        },
        {
          tool_name: 'QuickBooks Automations',
          description:
            'Auto-generate invoices, send payment reminders, and reconcile accounts automatically.',
        },
        {
          tool_name: 'Intercom',
          description:
            'Deploy an AI chatbot to handle routine customer questions 24/7, routing complex issues to your team.',
        },
      ],
      roi_metrics: {
        hours_saved_monthly: 142,
        cost_savings_monthly: 4260,
        roi_percentage: 318,
      },
    };
  }

  // Try to match a canned response
  for (const entry of MOCK_CONVERSATION) {
    if (entry.trigger.test(message)) {
      return { status: 'conversational', reply: entry.reply };
    }
  }

  return {
    status: 'conversational',
    reply:
      "Interesting — tell me more. What does a typical day look like for you operationally, and which manual task costs you the most time each week?",
  };
}

// ── Gemini call ─────────────────────────────────────────────────────────────

async function callGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Convert chat history to Gemini "contents" format
  const contents = messages.map((m) => ({
    role: m.role === 'ai' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Try to extract embedded JSON from the reply
  const jsonMatch = text.match(/\{[\s\S]*"status"\s*:\s*"(success|conversational)"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch {
      // Fall through
    }
  }

  // Plain conversational reply
  return { status: 'conversational', reply: text.trim() };
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Build full history including the new user message
    const fullHistory = [...history, { role: 'user', text: message }];

    // Try Gemini first, fall back to mock
    let result = await callGemini(fullHistory);
    if (!result) {
      result = mockResponse(message, history);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    return NextResponse.json(
      { status: 'conversational', reply: 'Something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
