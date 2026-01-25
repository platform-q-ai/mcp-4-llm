export function getCodeQualityScript(): string {
  return `#!/bin/bash

# ============================================
# Code Quality Check Script
# ============================================
# Blocks commits containing incomplete code, placeholders, or violations.

set -e

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m'

echo -e "\${BLUE}╔══════════════════════════════════════════════════════════════╗\${NC}"
echo -e "\${BLUE}║              Code Quality Check                              ║\${NC}"
echo -e "\${BLUE}╚══════════════════════════════════════════════════════════════╝\${NC}"
echo ""

ERRORS_FOUND=0

EXCLUDE_ARGS="--exclude=check-code-quality.sh --exclude=*.md --exclude=*.json --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=coverage --exclude-dir=reports"

# Check for word-bounded patterns (e.g., TODO, FIXME)
check_pattern() {
  local pattern="\$1"
  local search_dir="\$2"
  local description="\$3"
  
  local results
  results=\$(grep -rniE \$EXCLUDE_ARGS "\\b\${pattern}\\b" "\$search_dir" 2>/dev/null || true)
  
  if [ -n "\$results" ]; then
    echo -e "\${RED}❌ Found '\${pattern}' in \${description}:\${NC}"
    echo "\$results" | head -5
    local count
    count=\$(echo "\$results" | wc -l | tr -d ' ')
    if [ "\$count" -gt 5 ]; then
      echo -e "\${YELLOW}   ... and \$((\$count - 5)) more occurrences\${NC}"
    fi
    echo ""
    ERRORS_FOUND=1
  fi
}

# Check for literal patterns (e.g., .only(, @ts-ignore)
check_literal() {
  local pattern="\$1"
  local search_dir="\$2"
  local description="\$3"
  
  local results
  results=\$(grep -rniE \$EXCLUDE_ARGS "\${pattern}" "\$search_dir" 2>/dev/null || true)
  
  if [ -n "\$results" ]; then
    echo -e "\${RED}❌ Found '\${pattern}' in \${description}:\${NC}"
    echo "\$results" | head -5
    local count
    count=\$(echo "\$results" | wc -l | tr -d ' ')
    if [ "\$count" -gt 5 ]; then
      echo -e "\${YELLOW}   ... and \$((\$count - 5)) more occurrences\${NC}"
    fi
    echo ""
    ERRORS_FOUND=1
  fi
}

echo -e "\${YELLOW}📁 Checking source files (src/)...\${NC}"
echo ""

# Check for incomplete work markers
for pattern in TODO FIXME XXX HACK BUG; do
  check_pattern "\$pattern" "src" "source files"
done

# Check for placeholder text
check_pattern "not implemented" "src" "source files"
check_pattern "implement this" "src" "source files"
check_pattern "placeholder" "src" "source files"

# Check for test code in production
for pattern in mock fake dummy; do
  check_pattern "\$pattern" "src" "production code"
done

# Check for focused/skipped tests in production
check_literal "\\.only\\(" "src" "production code"
check_literal "\\.skip\\(" "src" "production code"

# Check for anti-patterns
check_literal "as any" "src" "source files"
check_literal "@ts-ignore" "src" "source files"
check_literal "@ts-expect-error" "src" "source files"
check_literal "eslint-disable" "src" "source files"

echo -e "\${YELLOW}📁 Checking test files (tests/)...\${NC}"
echo ""

for pattern in TODO FIXME XXX HACK; do
  check_pattern "\$pattern" "tests" "test files"
done

echo -e "\${YELLOW}🔍 Checking for stub implementations...\${NC}"
echo ""

THROW_NOT_IMPL=\$(grep -rniE \$EXCLUDE_ARGS "throw new Error.*not.*implement" src tests 2>/dev/null || true)
if [ -n "\$THROW_NOT_IMPL" ]; then
  echo -e "\${RED}❌ Found throw not implemented:\${NC}"
  echo "\$THROW_NOT_IMPL"
  echo ""
  ERRORS_FOUND=1
fi

CONSOLE_LOG=\$(grep -rniE \$EXCLUDE_ARGS "console\\.log\\(" src 2>/dev/null || true)
if [ -n "\$CONSOLE_LOG" ]; then
  echo -e "\${RED}❌ Found console.log (use console.error for MCP):\${NC}"
  echo "\$CONSOLE_LOG"
  echo ""
  ERRORS_FOUND=1
fi

echo -e "\${BLUE}══════════════════════════════════════════════════════════════\${NC}"
echo ""

if [ \$ERRORS_FOUND -eq 0 ]; then
  echo -e "\${GREEN}✅ Code quality check passed!\${NC}"
  exit 0
else
  echo -e "\${RED}❌ Code quality check failed!\${NC}"
  echo "Please resolve the issues above before committing."
  exit 1
fi
`;
}
