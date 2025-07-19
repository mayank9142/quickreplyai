const API_KEYS = [
  // 'AIzaSyCsxLOPBFUORb67cuZb_tDPhm9ZZKJbuws',
  'AIzaSyCIG_Igm1W4QjY-Odpsg0NDl1TAOsWWs-c',
  'AIzaSyBP0IiDOgq0X-8vdy6mIJrwWTWPWNtU6y0',
  'AIzaSyByFZWoLt8zq5hzJJ5KkUvKasfCDnLbRyM'
];

const MODEL = 'gemini-1.5-flash';

async function callGemini(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 300,
    },
  };

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.candidates?.length) {
        const errMsg = data?.error?.message || res.statusText;
        if (res.status === 429 || errMsg.toLowerCase().includes('quota')) {
          console.warn(`⚠️ API key ${i + 1} failed: ${errMsg}`);
          continue;
        }
        return `❌ Gemini error: ${errMsg}`;
      }

      const text = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
      return text || '❌ Gemini returned empty content.';
    } catch (err) {
      console.error(`❌ Fetch error with key ${i + 1}:`, err.message);
      continue;
    }
  }

  return '❌ All Gemini API keys failed. Please try again later.';
}

// ✅ Detect language and generate subject line
export async function analyzeLanguageAndSubject(message) {
  try {
    const langPrompt = `What language is this message written in? Reply only with the language name.\n\n"""${message}"""`;
    const subjectPrompt = `Suggest a short, clean, professional subject line for replying to this message. Do not include quotes or symbols.\n\n"${message}"`;

    const [language, subject] = await Promise.all([
      callGemini(langPrompt),
      callGemini(subjectPrompt),
    ]);

    const cleanedSubject = subject
      .replace(/[*"'.]/g, '')
      .trim()
      .slice(0, 50);

    return {
      language: language.trim(),
      subject: cleanedSubject,
    };
  } catch (err) {
    console.error('❌ Error analyzing:', err);
    return {
      language: 'English',
      subject: '',
    };
  }
}

// ✅ Generate reply in correct tone AND language
export async function generateSmartReply(message, tone = 'formal', lang = 'English') {
  const prompt = `
You are a smart and helpful assistant. Read the message below and write a short, intelligent reply in the language: ${lang}.

Instructions:
- Reply in ${lang} only (no English if input is in another language)
- Tone should be ${tone} (formal or casual)
- Keep it brief (2–4 lines max), human-like, and to the point
- Avoid robotic or repetitive phrases
- Do NOT translate or explain
- Do NOT include "Reply:" in the response

Message:
"""${message}"""
`;

  return await callGemini(prompt);
}
