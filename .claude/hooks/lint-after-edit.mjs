// PostToolUse (Edit|Write|MultiEdit): corre eslint sobre el .ts/.tsx editado bajo src/ y muestra los errores.
import { spawnSync } from 'node:child_process'
import { readInput, projectDir, relPath, block } from './lib.mjs'

const input = await readInput()
const filePath = input.tool_input?.file_path
if (!filePath) process.exit(0)

const rel = relPath(input, filePath)
if (!rel.startsWith('src/') || !/\.tsx?$/.test(rel)) process.exit(0)

const res = spawnSync('npx', ['eslint', rel], {
  cwd: projectDir(input),
  encoding: 'utf8',
  shell: process.platform === 'win32', // npx es npx.cmd en Windows
  timeout: 60_000,
})

if (res.error) {
  // No se pudo ejecutar eslint: avisar sin trabar la edición.
  process.stderr.write(`lint-after-edit: no se pudo correr eslint (${res.error.message})\n`)
  process.exit(1)
}
if (res.status !== 0) {
  block(`ESLint encontró problemas en ${rel}:\n${(res.stdout + res.stderr).trim()}`)
}
process.exit(0)
