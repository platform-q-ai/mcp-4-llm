import { getAgentsMd } from './agents-md.js';

/**
 * CLAUDE.md and AGENTS.md should be identical.
 * Claude Code auto-loads CLAUDE.md files along the file path.
 * Other tools use AGENTS.md as the convention.
 * We generate both with the same content.
 */
export function getClaudeMd(name: string): string {
  return getAgentsMd(name);
}
