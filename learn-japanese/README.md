# Nihongo Blocks 🧩

A tiny, kid-friendly app for learning basic Japanese sentence structure.
Tap colorful blocks to build real Japanese sentences, hear them spoken, and earn stars.

## How it works
- **Colors show each word's job.** The particle (the round block) paints the word in front of it:
  blue は = what we talk about · green を = the thing · purple に = going to · orange で = where it happens ·
  pink の = belongs to · red = the action, which always goes **last**.
- **Build** — tap the blocks in the right order. Wrong taps just wiggle; after two misses the right block glows.
- **Pick** — choose the missing block.
- 🔊 Tap any block to hear it. **Aa / あ** shows or hides the English letters (romaji).

## Talk with Neko-sensei 🐱💬
A real conversation partner powered by Claude. It understands Japanese, romaji, English or a mix, even with mistakes.
- **Speak** with the 🎤 button (choose 日本語 or English), **type**, or just **tap** one of the three ready-made answers.
- Every reply is broken into the same colored blocks, with the English meaning and a 💡 tip that explains one grammar point or gently fixes a mistake.
- Replies are read aloud. Tap 🔊 to hear one again, or tap any block to hear that word and see its meaning.

**Turning it on for the website:** in Vercel, open the project → **Settings → Environment Variables**, add
`ANTHROPIC_API_KEY` with a key from https://console.anthropic.com, then redeploy. The chat runs through
[`api/chat.js`](../api/chat.js). Each message is billed to that key. The downloaded single file can't chat, because it has no server.

Lessons: これは… · か questions · を · に · で · の · ません (not) · ました (past) · describing words · Big Challenge review.

## Get the app
- **Install (phone/tablet/computer):** open the hosted page, then tap **📲 Install app**
  (Android/Chrome/Edge) or **Share → Add to Home Screen** (iPhone/iPad). Works offline afterwards.
- **Download:** tap **⬇️ Download** on the home screen, or just save `index.html` —
  it is a single self-contained file that opens in any browser, no internet needed.

No build step, no dependencies. Progress is saved on the device.
