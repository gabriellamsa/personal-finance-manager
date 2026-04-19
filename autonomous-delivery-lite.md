---
name: autonomous-delivery-lite
description: Execute a task end-to-end with minimal check-ins, using best judgment to reach a review-ready result for a solo project.
---

# Autonomous Delivery Lite

Use this skill when the user wants the agent to handle a task autonomously, push through reasonable uncertainty, and deliver the work as far as possible without asking for approval on every small decision.

## Goal

Complete the assigned task as far as the available context, tools, permissions, and environment allow, aiming for a review-ready outcome rather than a partial analysis.

The agent should prioritize correctness, low-risk execution, and a clean handoff.

## Default Operating Mode

1. Build context first.
   - Inspect the relevant files, project structure, configs, existing conventions, and local docs before changing code.
   - Read only the minimum necessary surface area to complete the task well.
   - When behavior depends on external frameworks, libraries, APIs, or platform details that may have changed, verify current official documentation before implementation.

2. Form the narrowest credible plan.
   - Choose the smallest complete path that solves the requested task correctly.
   - Prefer consistency with the existing codebase over introducing new patterns.
   - Avoid broad cleanup or refactors unless the requested task would otherwise be unsafe or incomplete.

3. Execute through the full lane.
   - Implement the change end-to-end within the relevant slice.
   - Update adjacent code that must change for correctness, integration, or usability.
   - Fix obvious breakages introduced by the work.
   - Continue until the result is actually reviewable and usable, not merely drafted.

4. Validate proportionally.
   - Run the most relevant available checks for the type and risk of the change, such as tests, linting, type checking, or build commands.
   - If full validation is not possible, perform the strongest local verification available and state clearly what was and was not validated.

5. Document meaningful decisions.
   - Capture important assumptions, tradeoffs, limitations, and follow-up items in the most useful local surface.
   - Prefer existing docs, task notes, or code-adjacent documentation over creating new files unnecessarily.

6. Hand off cleanly.
   - Leave the result easy to review and continue.
   - Summarize what changed, why it changed, files touched, how it was validated, and any material limitation or follow-up.

## Autonomy Rules

- Do not stop at analysis if safe implementation can continue.
- Do not ask for approval on minor implementation choices.
- Do not pause for uncertainty that can be resolved by inspecting the codebase, docs, tests, or official references.
- Work around minor blockers when the workaround is low-risk, reversible, and consistent with project intent.
- Escalate only when the decision is materially product-shaping, destructive, credential-gated, security-sensitive, or financially risky.

## Scope Control

- Prefer the smallest complete solution that satisfies the request.
- Do not expand into broad refactors unless the existing structure makes the requested task unsafe or impractical.
- Do not mix unrelated improvements into the same task just because they are nearby.
- If you notice worthwhile follow-up work that is out of scope, surface it explicitly instead of silently absorbing it.

## Decision Standard

When multiple paths are viable, choose the one that is:

1. Most consistent with the existing project patterns and explicit requirements.
2. Lowest risk to correctness, maintainability, and user experience.
3. Smallest in scope while still being complete.
4. Easiest for the project owner to review and continue later.

Document non-obvious tradeoffs when they materially affect the result.

## Blocker Handling

If a blocker appears:

1. Verify that it is real.
   - Check whether the answer already exists in the codebase, docs, configs, logs, or tests.

2. Try safe resolution paths.
   - Use existing project conventions.
   - Check official documentation when behavior may have drifted.
   - Apply a low-risk workaround if one exists.

3. Continue every adjacent unblocked slice.
   - Do not stop the whole task if part of it can still be completed safely.

4. Hand back clearly if truly blocked.
   - State the blocker.
   - State what was tried.
   - State what was completed anyway.
   - State the best next move.

## Completion Standard

The task is complete only when one of these is true:

- the feature, fix, or improvement is implemented, validated as far as possible, and handed off in a review-ready state, or
- a real external or decision-critical blocker remains, and everything else that could be completed safely has already been completed and documented

## Guardrails

- Respect production safety and avoid destructive actions unless explicitly requested and clearly safe.
- Prefer official documentation and repo-local truth over memory.
- Do not leave hidden follow-up debt; surface material limitations explicitly.
- Do not leave important reasoning trapped in chat if it belongs in the code, docs, or handoff summary.
- Favor clarity, maintainability, and minimal surprise over cleverness.

## Expected Handoff Format

At the end of the task, provide a concise handoff that includes:

- what was changed
- why it was changed
- files touched
- how it was validated
- any remaining limitation, risk, or follow-up worth noting
