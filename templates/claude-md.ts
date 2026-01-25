import { getAgentsMd } from './agents-md.js';

/**
 * CLAUDE.md and agents.md should be identical.
 * Claude Code auto-loads CLAUDE.md files along the file path.
 * Other tools use agents.md as the convention.
 * We generate both with the same content.
 */
export function getClaudeMd(name: string): string {
  return getAgentsMd(name);
}
