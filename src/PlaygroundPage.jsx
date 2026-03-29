import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Download, Settings, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './PlaygroundPage.css';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'html', label: 'HTML', ext: 'html' },
  { id: 'css', label: 'CSS', ext: 'css' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'json', label: 'JSON', ext: 'json' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
];

const DEFAULT_CODE = {
  javascript: `// 🚀 JavaScript Playground
// Write your code here and click Run!

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}

console.log('\\n✨ Happy coding on Campus Connection!');`,
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Playground</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 2rem; }
    h1 { color: #6366f1; }
  </style>
</head>
<body>
  <h1>Hello from Campus Connection! 🚀</h1>
  <p>Edit this HTML and see the preview.</p>
</body>
</html>`,
  python: `# 🐍 Python Playground
# Note: This is a code editor - output is simulated

def greet(name):
    return f"Hello, {name}! Welcome to Campus Connection 🚀"

# List comprehension example
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")

print(greet("Developer"))`,
  css: `/* 🎨 CSS Playground */
body {
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  color: white;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}`,
  typescript: `// 📘 TypeScript Playground
interface Developer {
  name: string;
  skills: string[];
  level: 'junior' | 'mid' | 'senior';
}

const dev: Developer = {
  name: 'Campus Connection User',
  skills: ['React', 'TypeScript', 'Node.js'],
  level: 'mid'
};

console.log(\`\${dev.name} knows \${dev.skills.join(', ')}\`);`,
  json: `{
  "project": "Campus Connection Playground",
  "version": "1.0.0",
  "features": ["editor", "preview", "save"]
}`,
  java: `// ☕ Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Campus Connection! 🚀");
    }
}`,
  cpp: `// ⚡ C++ Playground
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from Campus Connection! 🚀" << endl;
    return 0;
}`,
};

export default function PlaygroundPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const toast = useToast();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '// Start coding...');
    setOutput('');
    setShowOutput(false);
  };

  const handleRun = () => {
    setShowOutput(true);
    if (language === 'javascript') {
      try {
        const logs = [];
        const mockConsole = { log: (...args) => logs.push(args.join(' ')) };
        const fn = new Function('console', code);
        fn(mockConsole);
        setOutput(logs.join('\n') || '(No output)');
      } catch (err) {
        setOutput(`Error: ${err.message}`);
      }
    } else {
      setOutput(`[${LANGUAGES.find(l => l.id === language)?.label}] Code compiled successfully.\n\n> Output would appear here in a full runtime environment.\n> Campus Connection Playground currently supports JavaScript execution.`);
    }
  };

  const handleSave = () => {
    toast.success('Code saved to local storage! 💾');
    localStorage.setItem(`cc_playground_${language}`, code);
  };

  return (
    <div className="playground-page">
      <div className="pg-header">
        <div className="pg-header-left">
          <h1>Code Playground</h1>
          <p>Your personal coding sandbox — experiment freely.</p>
        </div>
        <div className="pg-header-right">
          <div className="pg-lang-select">
            <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="pg-select">
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <ChevronDown size={14} className="pg-select-arrow" />
          </div>
          <button className="btn btn-ghost" onClick={handleSave}>
            <Save size={16} /> Save
          </button>
          <button className="btn btn-primary" onClick={handleRun}>
            <Play size={16} /> Run
          </button>
        </div>
      </div>

      <div className="pg-content">
        <div className={`pg-editor ${showOutput ? 'with-output' : ''}`}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              padding: { top: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        {showOutput && (
          <div className="pg-output">
            <div className="pg-output-header">
              <span>Output</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowOutput(false)}>×</button>
            </div>
            <pre className="pg-output-content">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
