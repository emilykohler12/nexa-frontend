// PreToolUse (Edit|Write|MultiEdit): bloquea .env*, package-lock.json y dist/**.
import path from 'node:path'
import { readInput, relPath, block } from './lib.mjs'

const input = await readInput()
const filePath = input.tool_input?.file_path
if (!filePath) process.exit(0)

const rel = relPath(input, filePath)
const base = path.posix.basename(rel)

if (/^\.env(\..+)?$/.test(base) && !base.endsWith('.example')) {
  block(`Bloqueado: ${rel} puede tener credenciales reales. Usá .env.example para documentar variables.`)
}
if (base === 'package-lock.json') {
  block('Bloqueado: package-lock.json lo genera npm. No se edita a mano.')
}
if (rel === 'dist' || rel.startsWith('dist/')) {
  block('Bloqueado: dist/ es salida de build. Se regenera con `npm run build`.')
}
process.exit(0)
