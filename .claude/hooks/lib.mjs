// Utilidades compartidas por los hooks de Claude Code (leer el JSON de stdin, normalizar rutas).
import path from 'node:path'

export async function readInput() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function projectDir(input) {
  return path.resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd())
}

// Ruta relativa al proyecto, con "/" como separador. Si queda fuera del proyecto devuelve la absoluta.
export function relPath(input, filePath) {
  const abs = path.resolve(projectDir(input), filePath)
  const rel = path.relative(projectDir(input), abs).split(path.sep).join('/')
  return rel.startsWith('..') ? abs.split(path.sep).join('/') : rel
}

// Texto nuevo que trae una herramienta de edición (Write, Edit o MultiEdit).
export function newContent(toolInput = {}) {
  const parts = []
  if (typeof toolInput.content === 'string') parts.push(toolInput.content)
  if (typeof toolInput.new_string === 'string') parts.push(toolInput.new_string)
  if (Array.isArray(toolInput.edits)) {
    for (const e of toolInput.edits) if (typeof e?.new_string === 'string') parts.push(e.new_string)
  }
  return parts.join('\n')
}

export function block(message) {
  process.stderr.write(message + '\n')
  process.exit(2)
}
