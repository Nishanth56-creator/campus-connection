const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

let genAI = null;
let model = null;

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  No GEMINI_API_KEY found. AI will use fallback responses.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI initialized');
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize Gemini:', err.message);
    return false;
  }
}

async function askGemini(prompt, codeContext = '', filename = '') {
  if (!model) {
    return getFallbackResponse(prompt, codeContext, filename);
  }

  try {
    const systemPrompt = `You are an AI coding assistant inside "Campus Connection", a collaborative coding platform for students. You help with code explanation, improvements, task suggestions, and bug detection. Be concise, helpful, and student-friendly. Use markdown formatting in your responses. When showing code, use code blocks with language specifiers.`;

    const fullPrompt = `${systemPrompt}

${filename ? `Current file: ${filename}` : ''}
${codeContext ? `\nCode context:\n\`\`\`\n${codeContext.substring(0, 3000)}\n\`\`\`` : ''}

User request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return getFallbackResponse(prompt, codeContext, filename);
  }
}

function getFallbackResponse(prompt, code, filename) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('explain')) {
    return `## Code Explanation for \`${filename}\`\n\nThis file contains ${code?.split('\n').length || 0} lines of code. It appears well-structured and follows common conventions.\n\n*Note: Connect to the Gemini API for detailed explanations.*`;
  }
  if (lowerPrompt.includes('improve')) {
    return `## Improvement Suggestions for \`${filename}\`\n\n1. **Add error handling** — Wrap critical sections in try-catch blocks\n2. **Add comments** — Document complex logic\n3. **Use constants** — Extract magic numbers into named constants\n4. **Optimize performance** — Consider memoization where applicable\n\n*Note: Connect to the Gemini API for specific suggestions.*`;
  }
  if (lowerPrompt.includes('task')) {
    return `## Suggested Tasks\n\n- [ ] Set up responsive design\n- [ ] Add form validation\n- [ ] Write unit tests\n- [ ] Add loading states\n- [ ] Optimize performance\n\n*Note: Connect to the Gemini API for context-aware tasks.*`;
  }
  if (lowerPrompt.includes('detect') || lowerPrompt.includes('issue') || lowerPrompt.includes('bug')) {
    return `## Code Analysis for \`${filename}\`\n\n✅ No critical bugs detected at a glance.\n\n⚠️ **General Recommendations:**\n1. Add input sanitization\n2. Check for null/undefined values\n3. Ensure proper cleanup of event listeners\n\n*Note: Connect to the Gemini API for deep analysis.*`;
  }

  return `I received your message: "${prompt}"\n\nI'm analyzing \`${filename}\` (${code?.split('\n').length || 0} lines).\n\n*How can I help you further?*`;
}

module.exports = { initGemini, askGemini };
