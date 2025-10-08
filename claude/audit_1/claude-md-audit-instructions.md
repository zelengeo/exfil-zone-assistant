# AI Agent Instructions: CLAUDE.md Documentation Audit & Improvement

## Phase 1: Current State Analysis & Critique

### Step 1: Documentation Discovery & Mapping
1. **Locate all CLAUDE.md files** in the project
   - List full file paths
   - Note directory structure and hierarchy
   - Identify any naming inconsistencies

2. **Create a documentation tree diagram** showing:
   - Root-level CLAUDE.md
   - All nested CLAUDE.md files
   - Their relationships and dependencies
   - Any orphaned or disconnected documentation
Done: [claude-md-audit-phase1-step1.md](claude-md-audit-phase1-step1.md)
   
### Step 2: Content Audit Per File
For each CLAUDE.md file found, analyze and document:

1. **Scope Definition**
   - Is the purpose of this specific documentation clear?
   - Does it define its boundaries (what it covers/doesn't cover)?
   - Is there overlap with other CLAUDE.md files?

2. **Technical Completeness**
   - File/folder structure description
   - Dependencies and imports
   - API endpoints or methods
   - State management patterns
   - Error handling approaches
   - Data flow descriptions

3. **Context Quality**
   - Does it reference the vr-game-wiki-project-spec artifact?
   - Are there clear examples?
   - Is the "why" explained, not just the "what"?
   - Are design decisions documented?

4. **AI-Readability Score** (1-5)
   - Clear, unambiguous language
   - Structured formatting
   - Explicit rather than implicit information
   - No assumed knowledge gaps
Done: [claude-md-audit-phase1-step2.md](claude-md-audit-phase1-step2.md)
   
### Step 3: Cross-Reference Analysis
1. **Identify gaps between files**:
   - Missing documentation for existing code
   - Undocumented features or components
   - Incomplete interaction descriptions

2. **Find redundancies**:
   - Duplicate information across files
   - Conflicting instructions
   - Outdated references

3. **Check consistency**:
   - Naming conventions
   - Format structure
   - Level of detail
   - Technology stack references (Tailwind 4.1.7, shadcn ui)
Done: [claude-md-audit-phase1-step3.md](claude-md-audit-phase1-step3.md)

### Step 4: Project-Specific Requirements Check
Verify each documentation includes:
1. TypeScript typing guidelines (avoiding "any")
2. Code modification best practices (partial updates only)
3. Component creation approach (incremental, not bulk)
4. Correct library versions and patterns
Done: [claude-md-audit-phase1-step4.md](claude-md-audit-phase1-step4.md)
   

## Phase 2: Improvement Recommendations

### Step 5: Structure Optimization Plan
Create a recommended structure addressing:
1. **Hierarchy improvements**
   - Optimal nesting levels
   - Clear parent-child relationships
   - Logical grouping of related components

2. **Missing documentation areas**
   - List all code areas needing CLAUDE.md files
   - Priority ranking (critical/important/nice-to-have)

3. **Consolidation opportunities**
   - Which files should be merged
   - Which need to be split
Done: [claude-md-audit-phase2-step5.md](claude-md-audit-phase2-step5.md)

### Step 6: Content Enhancement List
For each existing CLAUDE.md, provide:
1. **Required additions**:
   - Missing technical details
   - Absent context or examples
   - Undefined relationships

2. **Clarity improvements**:
   - Ambiguous sections to rewrite
   - Complex explanations to simplify
   - Missing visual aids or diagrams

3. **AI-optimization suggestions**:
   - Structured data formats to add
   - Keywords for better searchability
   - Clear action indicators
Done: [claude-md-audit-phase2-step6.md](claude-md-audit-phase2-step6.md)

### Step 7: Template Recommendations
Propose standardized templates for:
1. **Root-level CLAUDE.md**
   - Project overview section
   - Navigation to sub-documentation
   - Global conventions and standards

2. **Component-level CLAUDE.md**
   - Component purpose
   - Props/interfaces
   - Usage examples
   - Testing approach

3. **Feature-level CLAUDE.md**
   - Business logic explanation
   - User flow
   - Technical implementation
   - Edge cases
Done: [claude-md-audit-phase2-step7.md](claude-md-audit-phase2-step7.md)
   
## Phase 3: Implementation & Deployment

### Step 8: Priority Action Items
Create a ranked list of:
1. **Critical fixes** (blocking AI understanding)
2. **Important improvements** (significantly enhance AI performance)
3. **Nice-to-have additions** (marginal improvements)

## Output Format

### Final Deliverable Structure:
```
## CLAUDE.md Documentation Audit Report

### 1. Current State Overview
- Total files found: [number]
- Coverage percentage: [estimated]
- Overall quality score: [1-10]

### 2. Critical Issues Found
[Bulleted list with file paths and specific problems]

### 3. Missing Documentation Areas
[Prioritized list of undocumented features/components]

### 4. Redundancy & Conflict Report
[Specific instances requiring resolution]

### 5. Recommended Documentation Structure
[Visual tree or detailed outline]

### 6. File-by-File Improvement Tasks
[Specific, actionable items per file]

### 7. Implementation Roadmap
[Phased approach to updating documentation]

### 8. Success Metrics
[How to measure documentation completeness]
```

## Meta-Instructions for the Reviewing AI:

1. **Be specific**: Use exact file paths and line numbers where applicable
2. **Be actionable**: Every critique should have a corresponding fix
3. **Be comprehensive**: Don't skip "obvious" things - document everything
4. **Be consistent**: Apply the same standards to all files
5. **Be practical**: Consider the effort vs. benefit of each suggestion

## Expected Time Investment:
- Analysis Phase: 2-3 hours
- Report Generation: 1-2 hours
- Total: 3-5 hours for comprehensive audit