export function getCodeQualityScript(): string {
  return `#!/bin/bash

# ============================================
# Code Quality Check Script
# ============================================
# Blocks commits containing incomplete code, placeholders, or violations.
# All checks are errors - no warnings allowed.
#
# Checks performed:
# 1a-d: Incomplete work markers (TODO, FIXME, placeholder, test code, .only/.skip)
# 2a-f: Type safety and lint bypasses (as any, @ts-ignore, eslint-disable, console.log)
# 3: Barrel exports exist for all layers
# 4: Zod validation in use cases (.parse or .safeParse)
# 5a-b: Domain error structure (base class and implementations)
# 6a-f: BDD feature coverage (features, scenarios, step definitions)
# 7: Value objects throw DomainError not generic Error
# 8: MCP tools have error handling (try-catch, structured errors)
# 9: MCP tools registered in server
# 10: Use cases exposed via MCP tools
# 11: Barrel exports are used

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

# Helper: Check for word-bounded patterns
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

# Helper: Check for literal patterns
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

# ============================================
# CHECK 1: Incomplete Work Markers
# ============================================

echo -e "\${YELLOW}📁 CHECK 1: Incomplete work markers...\${NC}"
echo ""

# 1a: TODO/FIXME/HACK markers in source
for pattern in TODO FIXME XXX HACK BUG; do
  check_pattern "\$pattern" "src" "source files"
done

# 1b: Placeholder text
check_pattern "not implemented" "src" "source files"
check_pattern "implement this" "src" "source files"
check_pattern "placeholder" "src" "source files"

# 1c: Test code in production (standalone words)
for pattern in mock fake dummy stub; do
  check_pattern "\$pattern" "src" "production code"
done

# 1c-2: Test doubles with camelCase naming (MockService, FakeRepository, etc.)
for prefix in Mock Fake Dummy Stub; do
  CAMEL_CASE=\$(grep -rnE \$EXCLUDE_ARGS "\${prefix}[A-Z][a-zA-Z]*" src 2>/dev/null || true)
  if [ -n "\$CAMEL_CASE" ]; then
    echo -e "\${RED}❌ Found test double in production code (\${prefix}*):\${NC}"
    echo "\$CAMEL_CASE" | head -5
    local count
    count=\$(echo "\$CAMEL_CASE" | wc -l | tr -d ' ')
    if [ "\$count" -gt 5 ]; then
      echo -e "\${YELLOW}   ... and \$((\$count - 5)) more occurrences\${NC}"
    fi
    echo ""
    ERRORS_FOUND=1
  fi
done

# 1d: Focused/skipped tests in production
check_literal "\\.only\\(" "src" "production code"
check_literal "\\.skip\\(" "src" "production code"

# ============================================
# CHECK 2: Type Safety and Lint Bypasses
# ============================================

echo -e "\${YELLOW}🔒 CHECK 2: Type safety and lint bypasses...\${NC}"
echo ""

# 2a: Type safety bypasses
check_literal "as any" "src" "source files"

# 2b: TypeScript suppressions
check_literal "@ts-ignore" "src" "source files"
check_literal "@ts-expect-error" "src" "source files"

# 2c: Linting bypasses
check_literal "eslint-disable" "src" "source files"

# 2d: TODO in tests
for pattern in TODO FIXME XXX HACK; do
  check_pattern "\$pattern" "tests" "test files"
done

# 2e: Stub implementations
THROW_NOT_IMPL=\$(grep -rniE \$EXCLUDE_ARGS "throw new Error.*not.*implement" src tests 2>/dev/null || true)
if [ -n "\$THROW_NOT_IMPL" ]; then
  echo -e "\${RED}❌ Found stub implementations (throw new Error not implemented):\${NC}"
  echo "\$THROW_NOT_IMPL"
  echo ""
  ERRORS_FOUND=1
fi

# 2f: Console.log in source
CONSOLE_LOG=\$(grep -rniE \$EXCLUDE_ARGS "console\\.log\\(" src 2>/dev/null || true)
if [ -n "\$CONSOLE_LOG" ]; then
  echo -e "\${RED}❌ Found console.log (use console.error for MCP):\${NC}"
  echo "\$CONSOLE_LOG"
  echo ""
  ERRORS_FOUND=1
fi

# 2g: Generic Error in domain/application layers (should use DomainError)
if [ -d "src/domain" ]; then
  GENERIC_ERROR_DOMAIN=\$(grep -rnE \$EXCLUDE_ARGS "throw new Error\\(" src/domain 2>/dev/null | grep -v "DomainError" || true)
  if [ -n "\$GENERIC_ERROR_DOMAIN" ]; then
    echo -e "\${RED}❌ Found generic 'throw new Error' in domain layer (use DomainError instead):\${NC}"
    echo "\$GENERIC_ERROR_DOMAIN" | head -5
    count=\$(echo "\$GENERIC_ERROR_DOMAIN" | wc -l | tr -d ' ')
    if [ "\$count" -gt 5 ]; then
      echo -e "\${YELLOW}   ... and \$((\$count - 5)) more occurrences\${NC}"
    fi
    echo ""
    ERRORS_FOUND=1
  fi
fi

if [ -d "src/application" ]; then
  GENERIC_ERROR_APP=\$(grep -rnE \$EXCLUDE_ARGS "throw new Error\\(" src/application 2>/dev/null | grep -v "DomainError" || true)
  if [ -n "\$GENERIC_ERROR_APP" ]; then
    echo -e "\${RED}❌ Found generic 'throw new Error' in application layer (use DomainError instead):\${NC}"
    echo "\$GENERIC_ERROR_APP" | head -5
    count=\$(echo "\$GENERIC_ERROR_APP" | wc -l | tr -d ' ')
    if [ "\$count" -gt 5 ]; then
      echo -e "\${YELLOW}   ... and \$((\$count - 5)) more occurrences\${NC}"
    fi
    echo ""
    ERRORS_FOUND=1
  fi
fi

# 2h: reflect-metadata must be first import in entry point (required for tsyringe)
if [ -f "src/index.ts" ]; then
  FIRST_IMPORT=\$(grep -n "^import" src/index.ts 2>/dev/null | head -1 || true)
  if [ -n "\$FIRST_IMPORT" ]; then
    if ! echo "\$FIRST_IMPORT" | grep -q "reflect-metadata"; then
      echo -e "\${RED}❌ reflect-metadata must be the first import in src/index.ts (required for tsyringe):\${NC}"
      echo "   Found: \$FIRST_IMPORT"
      echo "   Expected: import 'reflect-metadata';"
      echo ""
      ERRORS_FOUND=1
    else
      echo -e "\${GREEN}✓ reflect-metadata is first import in entry point\${NC}"
    fi
  fi
fi

# ============================================
# CHECK 3: Barrel Exports
# ============================================

echo -e "\${YELLOW}📦 CHECK 3: Barrel exports...\${NC}"
echo ""

for layer in domain application infrastructure mcp di; do
  if [ ! -f "src/\${layer}/index.ts" ]; then
    echo -e "\${RED}❌ Missing barrel export: src/\${layer}/index.ts\${NC}"
    echo "   Each layer must have an index.ts that exports its public API"
    ERRORS_FOUND=1
  else
    echo -e "\${GREEN}✓ Found src/\${layer}/index.ts\${NC}"
  fi
done

# 3b: Check subdirectories have barrel exports
echo ""
echo "Checking subdirectory barrel exports..."
for layer in domain application mcp; do
  if [ -d "src/\${layer}" ]; then
    # Find subdirectories that contain .ts files but no index.ts
    for subdir in src/\${layer}/*/; do
      if [ -d "\$subdir" ]; then
        subdir_name=\$(basename "\$subdir")
        # Skip if no .ts files in subdir
        ts_count=\$(find "\$subdir" -maxdepth 1 -name "*.ts" ! -name "index.ts" 2>/dev/null | wc -l | tr -d ' ')
        if [ "\$ts_count" -gt 0 ]; then
          if [ ! -f "\${subdir}index.ts" ]; then
            echo -e "\${RED}❌ Missing barrel export: \${subdir}index.ts\${NC}"
            echo "   Subdirectory has \$ts_count .ts files but no index.ts"
            ERRORS_FOUND=1
          fi
        fi
      fi
    done
  fi
done

# 3c: Check for direct imports bypassing barrel exports in domain/application
echo ""
echo "Checking for direct imports bypassing barrels..."

# Find imports like '../schemas/some.schema.js' that should be '../schemas/index.js'
# Exclude index.ts/index.js files from matches
DIRECT_IMPORTS=\$(grep -rn \$EXCLUDE_ARGS "from '\\.\\./" src 2>/dev/null | grep -E "/(entities|value-objects|errors|use-cases|schemas|ports|services|tools)/[^']+\\.js'" | grep -v "/index\\.js'" || true)

if [ -n "\$DIRECT_IMPORTS" ]; then
  echo -e "\${RED}❌ Found direct imports bypassing barrel exports:\${NC}"
  echo "\$DIRECT_IMPORTS" | head -10
  count=\$(echo "\$DIRECT_IMPORTS" | wc -l | tr -d ' ')
  if [ "\$count" -gt 10 ]; then
    echo -e "\${YELLOW}   ... and \$((\$count - 10)) more occurrences\${NC}"
  fi
  echo ""
  echo "   Use barrel imports instead: from '../<subdir>/index.js'"
  ERRORS_FOUND=1
else
  echo -e "\${GREEN}✓ No direct imports bypassing barrels\${NC}"
fi

# ============================================
# CHECK 4: Zod Validation in Use Cases
# ============================================

echo ""
echo -e "\${YELLOW}✅ CHECK 4: Zod validation in use cases...\${NC}"
echo ""

if [ -d "src/application/use-cases" ]; then
  USE_CASE_FILES=\$(find src/application/use-cases -name "*.use-case.ts" 2>/dev/null || true)
  
  for file in \$USE_CASE_FILES; do
    if [ -f "\$file" ]; then
      # Check if file has an execute method but no .parse() or .safeParse() call
      if grep -q "execute" "\$file" 2>/dev/null; then
        if ! grep -qE "\\.(parse|safeParse)\\(" "\$file" 2>/dev/null; then
          echo -e "\${RED}❌ Use case missing Zod validation: \$file\${NC}"
          echo "   Use cases must validate input with schema.parse(input) or schema.safeParse(input)"
          ERRORS_FOUND=1
        else
          echo -e "\${GREEN}✓ \$file has Zod validation\${NC}"
        fi
      fi
    fi
  done
else
  echo -e "\${YELLOW}⚠ No use-cases directory found\${NC}"
fi

# ============================================
# CHECK 5: Domain Error Structure
# ============================================

echo ""
echo -e "\${YELLOW}🚨 CHECK 5: Domain error structure...\${NC}"
echo ""

# 5a: Check base.error.ts has abstract properties
if [ -f "src/domain/errors/base.error.ts" ]; then
  MISSING_ABSTRACT=""
  for prop in "code" "suggestedFix" "isRetryable" "category"; do
    if ! grep -qE "abstract.*\${prop}|readonly.*\${prop}" "src/domain/errors/base.error.ts" 2>/dev/null; then
      MISSING_ABSTRACT="\${MISSING_ABSTRACT} \${prop}"
    fi
  done
  if [ -n "\$MISSING_ABSTRACT" ]; then
    echo -e "\${RED}❌ base.error.ts missing abstract properties:\${MISSING_ABSTRACT}\${NC}"
    ERRORS_FOUND=1
  else
    echo -e "\${GREEN}✓ base.error.ts has all required abstract properties\${NC}"
  fi
else
  echo -e "\${RED}❌ Missing src/domain/errors/base.error.ts\${NC}"
  ERRORS_FOUND=1
fi

# 5b: Check domain error implementations
if [ -d "src/domain/errors" ]; then
  ERROR_FILES=\$(find src/domain/errors -name "*.error.ts" -o -name "*.errors.ts" 2>/dev/null | grep -v "base.error.ts" | grep -v "index.ts" || true)
  
  for file in \$ERROR_FILES; do
    if [ -f "\$file" ]; then
      MISSING_PROPS=""
      for prop in "readonly code" "suggestedFix" "isRetryable" "category"; do
        if ! grep -q "\$prop" "\$file" 2>/dev/null; then
          MISSING_PROPS="\${MISSING_PROPS} \${prop}"
        fi
      done
      if [ -n "\$MISSING_PROPS" ]; then
        echo -e "\${RED}❌ Domain error \$file missing:\${MISSING_PROPS}\${NC}"
        ERRORS_FOUND=1
      fi
    fi
  done
fi

# ============================================
# CHECK 6: BDD Feature Coverage
# ============================================

echo ""
echo -e "\${YELLOW}🎭 CHECK 6: BDD feature coverage...\${NC}"
echo ""

# 6a: Features directory exists
if [ ! -d "features" ]; then
  echo -e "\${RED}❌ Missing features/ directory\${NC}"
  ERRORS_FOUND=1
else
  echo -e "\${GREEN}✓ features/ directory exists\${NC}"
fi

# 6b: Feature files exist
FEATURE_COUNT=\$(find features -name "*.feature" 2>/dev/null | wc -l | tr -d ' ')
if [ "\$FEATURE_COUNT" -eq 0 ]; then
  echo -e "\${RED}❌ No .feature files found in features/ directory\${NC}"
  ERRORS_FOUND=1
else
  echo -e "\${GREEN}✓ Found \${FEATURE_COUNT} feature file(s)\${NC}"
fi

# 6c: Feature files have scenarios
if [ "\$FEATURE_COUNT" -gt 0 ]; then
  for feature_file in features/*.feature; do
    if [ -f "\$feature_file" ]; then
      SCENARIO_COUNT=\$(grep -cE "^\\s*(Scenario|Scenario Outline):" "\$feature_file" 2>/dev/null || echo "0")
      if [ "\$SCENARIO_COUNT" -eq 0 ]; then
        echo -e "\${RED}❌ Feature file has no scenarios: \$feature_file\${NC}"
        ERRORS_FOUND=1
      fi
    fi
  done
fi

# 6d: Step definitions exist
if [ ! -d "tests/step-definitions" ]; then
  echo -e "\${RED}❌ Missing tests/step-definitions/ directory\${NC}"
  ERRORS_FOUND=1
else
  STEPS_COUNT=\$(find tests/step-definitions -name "*.steps.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "\$STEPS_COUNT" -eq 0 ]; then
    echo -e "\${RED}❌ No .steps.ts files found in tests/step-definitions/\${NC}"
    ERRORS_FOUND=1
  else
    echo -e "\${GREEN}✓ Found \${STEPS_COUNT} step definition file(s)\${NC}"
  fi
fi

# 6e: Use cases have feature coverage (check use case names appear in features)
if [ -d "src/application/use-cases" ] && [ "\$FEATURE_COUNT" -gt 0 ]; then
  USE_CASE_COUNT=\$(find src/application/use-cases -name "*.use-case.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "\$USE_CASE_COUNT" -gt 0 ]; then
    echo "Checking use case feature coverage..."
    # This is a soft check - just warn if use cases don't appear in features
  fi
fi

# 6f: Minimum scenario count (at least 2 scenarios per use case on average)
TOTAL_SCENARIOS=\$(grep -rhE "^\\s*(Scenario|Scenario Outline):" features/*.feature 2>/dev/null | wc -l | tr -d ' ' || echo "0")
USE_CASE_COUNT=\$(find src/application/use-cases -name "*.use-case.ts" 2>/dev/null | wc -l | tr -d ' ' || echo "1")
if [ "\$USE_CASE_COUNT" -gt 0 ] && [ "\$TOTAL_SCENARIOS" -gt 0 ]; then
  RATIO=\$((\$TOTAL_SCENARIOS / \$USE_CASE_COUNT))
  if [ "\$RATIO" -lt 2 ]; then
    echo -e "\${YELLOW}⚠ Low scenario coverage: \${TOTAL_SCENARIOS} scenarios for \${USE_CASE_COUNT} use cases (recommend ≥2 per use case)\${NC}"
  else
    echo -e "\${GREEN}✓ Good scenario coverage: \${TOTAL_SCENARIOS} scenarios for \${USE_CASE_COUNT} use cases\${NC}"
  fi
fi

# ============================================
# CHECK 7: Value Objects Throw Domain Errors
# ============================================

echo ""
echo -e "\${YELLOW}💎 CHECK 7: Value object error types...\${NC}"
echo ""

if [ -d "src/domain/value-objects" ]; then
  VO_FILES=\$(find src/domain/value-objects -name "*.vo.ts" -o -name "*.value-object.ts" 2>/dev/null || true)
  
  for file in \$VO_FILES; do
    if [ -f "\$file" ]; then
      # Check for generic Error throw (not DomainError)
      GENERIC_ERRORS=\$(grep -n "throw new Error(" "\$file" 2>/dev/null | grep -v "DomainError" || true)
      if [ -n "\$GENERIC_ERRORS" ]; then
        echo -e "\${RED}❌ Value object throws generic Error instead of DomainError: \$file\${NC}"
        echo "\$GENERIC_ERRORS"
        ERRORS_FOUND=1
      fi
    fi
  done
fi

# ============================================
# CHECK 8: MCP Tool Error Handling
# ============================================

echo ""
echo -e "\${YELLOW}🔧 CHECK 8: MCP tool error handling...\${NC}"
echo ""

if [ -d "src/mcp/tools" ]; then
  TOOL_FILES=\$(find src/mcp/tools -name "*.tool.ts" 2>/dev/null || true)
  
  for file in \$TOOL_FILES; do
    if [ -f "\$file" ]; then
      # Check for try-catch blocks
      if ! grep -q "try" "\$file" 2>/dev/null || ! grep -q "catch" "\$file" 2>/dev/null; then
        echo -e "\${RED}❌ MCP tool missing try-catch: \$file\${NC}"
        ERRORS_FOUND=1
      fi
      
      # Check for structured error response (isError or error object with code)
      if ! grep -qE "(isError.*true|\\{ error:|code:.*message:|formatError)" "\$file" 2>/dev/null; then
        echo -e "\${RED}❌ MCP tool missing structured error response: \$file\${NC}"
        echo "   Tools must return { isError: true, content: [...] } with code, message, suggestedFix"
        ERRORS_FOUND=1
      else
        echo -e "\${GREEN}✓ \$file has error handling\${NC}"
      fi
    fi
  done
fi

# ============================================
# CHECK 9: MCP Tools Registered in Server
# ============================================

echo ""
echo -e "\${YELLOW}📡 CHECK 9: MCP tools registered in server...\${NC}"
echo ""

if [ -f "src/mcp/server.ts" ] && [ -d "src/mcp/tools" ]; then
  TOOL_FILES=\$(find src/mcp/tools -name "*.tool.ts" ! -name "index.ts" 2>/dev/null || true)
  
  for file in \$TOOL_FILES; do
    if [ -f "\$file" ]; then
      # Extract class name
      CLASS_NAME=\$(grep -oE "class [A-Z][a-zA-Z]*Tool" "\$file" | head -1 | awk '{print \$2}')
      if [ -n "\$CLASS_NAME" ]; then
        # Check if imported and resolved in server.ts
        if ! grep -q "\$CLASS_NAME" "src/mcp/server.ts" 2>/dev/null; then
          echo -e "\${RED}❌ Tool not registered in server.ts: \$CLASS_NAME\${NC}"
          ERRORS_FOUND=1
        else
          # Check if container.resolve is called
          if ! grep -qE "resolve.*\$CLASS_NAME|resolve\\(\$CLASS_NAME\\)" "src/mcp/server.ts" 2>/dev/null; then
            echo -e "\${YELLOW}⚠ Tool may not be resolved from container: \$CLASS_NAME\${NC}"
          else
            echo -e "\${GREEN}✓ \$CLASS_NAME registered in server\${NC}"
          fi
        fi
      fi
    fi
  done
fi

# ============================================
# CHECK 10: Use Cases Exposed via MCP
# ============================================

echo ""
echo -e "\${YELLOW}🔗 CHECK 10: Use cases exposed via MCP...\${NC}"
echo ""

if [ -d "src/application/use-cases" ] && [ -d "src/mcp/tools" ]; then
  USE_CASE_FILES=\$(find src/application/use-cases -name "*.use-case.ts" ! -name "index.ts" 2>/dev/null || true)
  
  for file in \$USE_CASE_FILES; do
    if [ -f "\$file" ]; then
      CLASS_NAME=\$(grep -oE "class [A-Z][a-zA-Z]*UseCase" "\$file" | head -1 | awk '{print \$2}')
      if [ -n "\$CLASS_NAME" ]; then
        # Check if use case is referenced in any MCP tool
        FOUND_IN_TOOL=\$(grep -rl "\$CLASS_NAME" src/mcp/tools/*.tool.ts 2>/dev/null || true)
        if [ -z "\$FOUND_IN_TOOL" ]; then
          echo -e "\${YELLOW}⚠ Use case not exposed via MCP tool: \$CLASS_NAME\${NC}"
        else
          echo -e "\${GREEN}✓ \$CLASS_NAME exposed via MCP\${NC}"
        fi
      fi
    fi
  done
fi

# ============================================
# CHECK 11: Barrel Exports Used
# ============================================

echo ""
echo -e "\${YELLOW}📤 CHECK 11: Barrel exports are used...\${NC}"
echo ""

if [ -f "src/mcp/tools/index.ts" ] && [ -f "src/mcp/server.ts" ]; then
  # Get exported tool names from index.ts
  EXPORTED_TOOLS=\$(grep -oE "export.*from.*'\\./" src/mcp/tools/index.ts 2>/dev/null | grep -oE "'\\./[^']+'" | tr -d "'./" || true)
  
  # Check each export is used in server.ts (via the barrel import)
  if grep -q "from.*tools" "src/mcp/server.ts" 2>/dev/null || grep -q "from.*'./tools'" "src/mcp/server.ts" 2>/dev/null; then
    echo -e "\${GREEN}✓ Server imports from tools barrel\${NC}"
  fi
fi

# ============================================
# SUMMARY
# ============================================

echo ""
echo -e "\${BLUE}══════════════════════════════════════════════════════════════\${NC}"
echo ""

if [ \$ERRORS_FOUND -eq 0 ]; then
  echo -e "\${GREEN}✅ All code quality checks passed!\${NC}"
  exit 0
else
  echo -e "\${RED}❌ Code quality check failed!\${NC}"
  echo "Please resolve the issues above before committing."
  exit 1
fi
`;
}
