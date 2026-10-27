// PreToolUse (Edit|Write|MultiEdit): avisa (pide confirmación) si el texto nuevo parece traer un secreto.
import { readInput, relPath, newContent } from './lib.mjs'

const input = await readInput()
const filePath = input.tool_input?.file_path
const content = newContent(input.tool_input)
if (!content) process.exit(0)

const rel = filePath ? relPath(input, filePath) : ''
if (rel.endsWith('.env.example') || rel.endsWith('package-lock.json')) process.exit(0)

const PATTERNS = [
  ['clave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['clave de AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['token de GitHub', /\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/],
  ['clave tipo sk-', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['token de Sentry', /\bsntrys?_[A-Za-z0-9_=-]{20,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['DSN de Sentry con clave secreta', /https?:\/\/[0-9a-f]{16,}:[0-9a-f]{16,}@[\w.-]*sentry[\w.-]*/i],
  ['URL con usuario y contraseña', /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@'"`]+:[^\s/@'"`]{3,}@[^\s'"`]+/i],
  ['credencial literal', /\b(api[_-]?key|secret|token|passw(or)?d|access[_-]?key)\w*["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i],
]

const hits = []
for (const [name, re] of PATTERNS) {
  const m = content.match(re)
  if (m) hits.push(`${name}: ${m[0].slice(0, 6)}…(${m[0].length} caracteres)`)
}
if (hits.length === 0) process.exit(0)

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'ask',
    permissionDecisionReason:
      `Posible secreto en ${rel || 'el contenido nuevo'}: ${hits.join('; ')}. ` +
      'Los secretos van en variables de entorno (VITE_*, ojo: se exponen en el bundle) o en el backend, nunca en el código.',
  },
}))
process.exit(0)
