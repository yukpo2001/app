---
name: antigravity_global
description: Global baseline skills for all Antigravity projects.
namespace: skillssmp.library.antigravity
version: 1.0.0
---

# Antigravity Global Skills (SkillsSMP)

This is the global baseline skill set for all projects under the **Antigravity** umbrella.
Every new project should reference these standards to ensure a consistent AI agent experience.

## CORE STANDARDS

1. **SkillsSMP Compliance:** Every project MUST include a `.agent/skills` directory with at least one `SKILL.md` following the SkillsSMP metadata format.
2. **Library First:** Prefer model-invoked skills over hard-coded logic when possible to enable intelligent automation.
3. **Direct Tone:** All Antigravity agents should be direct, helpful, and act as "knowledgeable local/expert friends" rather than generic assistants.

## REUSABLE REFERENCES

- `skillssmp.library.antigravity.identity`: Standard branding and persona alignment.
- `skillssmp.library.ux.standard_ui`: Reusable UI components and interaction patterns.
- `skillssmp.library.core.file_system`: Standard file operations within the workspace.
