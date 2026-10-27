// PreToolUse (Bash): bloquea `git push --force` y `git push` hacia main.
// Se bloquea main por precaución: el repo no tiene un workflow de deploy, pero Vercel suele
// desplegar solo desde su integración con GitHub (no se puede verificar desde el código).
import { spawnSync } from 'node:child_process'
import { readInput, projectDir, block } from './lib.mjs'

const input = await readInput()
const command = input.tool_input?.command
if (typeof command !== 'string') process.exit(0)

function currentBranch() {
  const r = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: projectDir(input), encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : ''
}

// Cada comando encadenado (&&, ||, ;, |, salto de línea) se revisa por separado.
for (const segment of command.split(/&&|\|\||[;|\n]/)) {
  const tokens = segment.trim().split(/\s+/)
  const gitAt = tokens.indexOf('git')
  const pushAt = tokens.indexOf('push', gitAt + 1)
  if (gitAt === -1 || pushAt === -1) continue

  const args = tokens.slice(pushAt + 1)
  const flags = args.filter(a => a.startsWith('-'))
  const positional = args.filter(a => !a.startsWith('-'))

  if (flags.some(f => f === '-f' || f.startsWith('--force')) || positional.some(a => a.startsWith('+'))) {
    block('Bloqueado: `git push --force` (o +refspec) puede pisar historia remota. Pedíselo a Emily y que lo corra ella.')
  }

  // positional = [remoto, refspec...]. Sin refspec o con HEAD se empuja la rama actual.
  const refspecs = positional.slice(1)
  const targets = refspecs.length === 0 || refspecs.includes('HEAD') ? [currentBranch()] : []
  for (const r of refspecs) targets.push(r.split(':').pop().replace(/^refs\/heads\//, ''))

  if (targets.includes('main')) {
    block('Bloqueado: push a main. Un push a main puede desplegar en producción (Vercel). Hacelo recién cuando Emily lo pida.')
  }
}
process.exit(0)
