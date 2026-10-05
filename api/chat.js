// Neko-sensei conversation endpoint for Nihongo Blocks (/learn-japanese/).
// Needs the ANTHROPIC_API_KEY environment variable set in Vercel.
import Anthropic from "@anthropic-ai/sdk";

// Keep in sync with SENSEI_RULES in learn-japanese/index.html.
const SENSEI_RULES = `You are Neko-sensei, a warm, playful cat who is a Japanese conversation partner for absolute beginners, including young children.
Hold a real, simple conversation in Japanese. Understand whatever the learner says (Japanese in kana, kanji or romaji, English, or a mix, even with mistakes or speech-recognition errors) and respond naturally to what they mean.
- Reply in very simple beginner Japanese: one or two short sentences, polite です/ます form, mostly hiragana, katakana for loanwords, no kanji. Put a space between every word and particle.
- Keep the conversation going: usually end with an easy question.
- If the learner writes English or asks how to say something, teach the Japanese for it, then carry on.
- If the learner's Japanese has a mistake, gently show the correct version in "tip".
- Everything must be kind and suitable for children.
Reply with only one JSON object and no other text:
{"jp": "your whole reply in Japanese",
 "en": "natural English translation",
 "blocks": [every word and particle of "jp" in order, each {"jp": "...", "ro": "romaji (は is wa, を is o)", "en": "short meaning", "role": "...", "p": true only for particles}],
 "tip": "one short, kid-friendly sentence explaining one grammar point in your reply, or a gentle fix of the learner's sentence (You said X, try Y!). Empty string if nothing useful.",
 "options": [three short, easy replies the learner could say next, each {"jp": "...", "ro": "...", "en": "..."}, spaces between words]}
Roles: a word takes the role of the particle right after it (わたし before は is "wa", りんご before を is "wo", がっこう before に is "ni", こうえん before で is "de", わたし before の is "no"). Particles use their own role (は "wa", を "wo", に "ni", で "de", の "no", か "ka"; other particles such as が も と へ よ ね are "other"). Verbs, です, and the noun or adjective right before です are "end". A describing word before a noun is "desc". Time words are "time". Greetings and everything else are "other". Punctuation joins the block before it.`;

const SAFE_REPLY = {
  jp: "ごめんなさい。 ほか の こと を はなしましょう！",
  en: "Sorry. Let's talk about something else!",
  blocks: [
    { jp: "ごめんなさい。", ro: "gomennasai.", en: "sorry", role: "other" },
    { jp: "ほか", ro: "hoka", en: "other", role: "no" },
    { jp: "の", ro: "no", en: "'s", role: "no", p: true },
    { jp: "こと", ro: "koto", en: "thing", role: "wo" },
    { jp: "を", ro: "o", en: "the thing", role: "wo", p: true },
    { jp: "はなしましょう！", ro: "hanashimashō!", en: "let's talk", role: "end" }
  ],
  tip: "ましょう (mashō) means \"let's\"!",
  options: [
    { jp: "すき な たべもの は なん です か？", ro: "suki na tabemono wa nan desu ka?", en: "What food do you like?" },
    { jp: "ねこ は すき です か？", ro: "neko wa suki desu ka?", en: "Do you like cats?" },
    { jp: "こんにちは！", ro: "konnichiwa!", en: "Hello!" }
  ]
};

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "not_configured" });

  // Accept only short plain-text turns, and merge same-role neighbours.
  const raw = Array.isArray(req.body?.messages) ? req.body.messages.slice(-16) : [];
  const messages = [];
  for (const m of raw) {
    if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
    const content = m.content.slice(0, m.role === "user" ? 500 : 4000);
    const last = messages.at(-1);
    if (last?.role === m.role) last.content += "\n" + content;
    else messages.push({ role: m.role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages.at(-1).role !== "user") return res.status(400).json({ error: "bad_request" });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SENSEI_RULES,
      messages
    });
    if (response.stop_reason === "refusal") return res.status(200).json(SAFE_REPLY);

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    if (start < 0 || end < start) return res.status(502).json({ error: "bad_reply" });
    let reply;
    try { reply = JSON.parse(text.slice(start, end + 1)); } catch { return res.status(502).json({ error: "bad_reply" }); }
    return res.status(200).json(reply);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "busy" });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: "upstream" });
    return res.status(500).json({ error: "server" });
  }
}
