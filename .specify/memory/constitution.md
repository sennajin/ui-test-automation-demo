<!--
Sync Impact Report (v1.0.0 - Initial Ratification)
==================================================
Version Change: none → v1.0.0
Constitution Type: Live Store E2E Testing Governance
Ratification Date: 2025-10-11

NEW PRINCIPLES ESTABLISHED:
1. Priority Hierarchy: User Trust, Evidence Clarity, Sustainable Maintenance
2. Code Quality Standards: Readable Tests, Deterministic Execution
3. Testing Standards: Stable Selectors, Explicit Waits, Data Hygiene
4. User Experience Consistency: Core Flows, Navigation, Product Discovery
5. Performance Requirements: Fast Smoke Suite, Value-Proportional Runtime
6. Governance Decision Rules: Safety-First, Resilience, Human-Readable Reports
7. Trade-off Precedence: Safety > Clarity > Reliability > Breadth
8. Risk Management: Mitigation & Rollback Plans Required

TEMPLATES STATUS:
✅ .specify/templates/plan-template.md - Created with constitution check section
✅ .specify/templates/spec-template.md - Created with requirements alignment
✅ .specify/templates/tasks-template.md - Created with principle-driven task types
✅ .specify/templates/commands/constitution.md - Created with command definition
⚠ Runtime guidance docs - README.md to be created separately

FOLLOW-UP ACTIONS:
- Create project README.md referencing this constitution
- Establish initial test suite structure aligned with principles
- Configure CI/CD pipeline for smoke suite execution
-->

# Project Constitution

**Project Name:** UI Test Automation Demo  
**Domain:** Shopify Live Store E2E Testing  
**Constitution Version:** 1.0.0  
**Ratified:** 2025-10-11  
**Last Amended:** 2025-10-11

---

## Purpose

This constitution establishes the governing principles for UI test automation of a live Shopify store. These principles ensure that testing activities build user trust through safe, transparent, and maintainable practices while providing clear evidence of system health for both technical and non-technical stakeholders.

---

## Core Principles

### Principle 1: Priority Hierarchy

**User trust, evidence clarity, and sustainable maintenance take precedence over feature breadth.**

- Testing a live production store is a privilege that demands responsibility and restraint
- Every test result must provide clear, actionable evidence that non-engineers can interpret
- Long-term maintainability outweighs short-term convenience or exhaustive coverage
- Adding tests is not inherently valuable; adding confidence is

**Rationale:** Comprehensive but fragile test suites erode trust when they produce false positives, miss real issues, or become too expensive to maintain. A small, reliable suite that clearly communicates health is more valuable than extensive coverage that creates noise.

---

### Principle 2: Code Quality Standards

**Readable tests with clear intent, small focused assertions, and deterministic setup and teardown that leave no residue in the live store.**

- Test code MUST be as readable as production code; prefer explicit over clever
- Each test MUST have a single, clearly stated purpose reflected in its name
- Assertions MUST be small and focused; avoid compound expectations that hide failure causes
- Setup and teardown MUST be deterministic and idempotent
- Tests MUST NOT leave persistent data, sessions, or side effects in the live store
- Tests MUST NOT perform checkout, payment, or account creation unless explicitly designed for teardown

**Rationale:** Tests that are hard to read become liabilities. Tests that pollute the live store create technical debt and potential customer confusion. Deterministic execution is the foundation of reliable CI/CD integration.

---

### Principle 3: Testing Standards

**Stable user-centered selectors, explicit waits on meaningful readiness, data hygiene that avoids checkout and persistent accounts, and repeatable outcomes that remain valid as content changes.**

Selectors:
- MUST use stable, semantic attributes (ARIA labels, data-test-id, role) over brittle CSS classes or XPath
- MUST represent user-perceivable elements, not implementation details
- SHOULD have fallback strategies when primary selectors are unavailable

Waits:
- MUST wait for meaningful readiness (element visible AND interactable, data loaded, animations complete)
- MUST NOT use arbitrary sleep statements; all waits MUST have explicit conditions and timeouts
- MUST fail fast with clear messages when conditions are not met

Data Hygiene:
- Tests MUST use read-only operations wherever possible
- Tests that modify state (cart adds, wishlist) MUST restore original state before completion
- Tests MUST NOT create persistent accounts, addresses, or checkout records
- Tests MUST NOT rely on specific inventory quantities or time-sensitive promotions

Repeatability:
- Tests MUST pass reliably on repeated runs without manual intervention
- Tests MUST NOT depend on execution order or shared global state
- Tests MUST handle content changes gracefully (e.g., featured products may rotate)

**Rationale:** Flaky tests destroy confidence. Brittle selectors create maintenance burden. Tests that alter persistent store state risk customer experience and legal compliance. Content churn is inevitable in live stores; resilience is not optional.

---

### Principle 4: User Experience Consistency

**Core pages load successfully, primary navigation is visible and operable, product discovery is possible in at least one featured collection, and cart state changes are visible and reversible without surprise.**

Core Flows:
- Homepage loads and displays key navigation elements
- At least one collection page loads with discoverable products
- Product detail pages display essential information (title, price, add-to-cart)
- Cart page reflects additions and removals accurately
- Navigation between these pages is functional and responsive

Boundaries:
- Tests MUST stop before checkout submission
- Tests MUST verify state changes are visible to users (not just API responses)
- Tests MUST confirm reversibility (e.g., cart item can be removed after adding)

**Rationale:** These flows represent the minimum viable user journey. If these fail, the store is materially broken for customers. Verification focuses on user-perceivable outcomes, not internal state, because that's what impacts trust and revenue.

---

### Principle 5: Performance Requirements

**The smoke suite stays fast enough for routine pull request use, and any added checks provide value proportional to their runtime cost.**

- The full smoke suite MUST complete in under 5 minutes on standard CI infrastructure
- Individual test scenarios SHOULD complete in under 30 seconds
- Any test exceeding 60 seconds MUST justify its runtime cost with a written rationale
- New tests MUST demonstrate value (e.g., "catches regression X") proportional to their maintenance and execution cost
- Parallelization is encouraged but MUST NOT introduce race conditions or shared state issues

**Rationale:** Slow tests discourage frequent runs, reducing their value. If developers bypass tests due to runtime, the suite has failed its purpose. Performance is a feature, not an optimization.

---

### Principle 6: Governance Decision Rules

**Prefer safety over coverage when testing a live store; prefer resilience to content churn by pinning a small set of anchor targets and providing sensible fallbacks; prefer human-readable reports with embedded evidence so non-engineers can evaluate results quickly; prefer minimal configuration with clear defaults that can be overridden when needed.**

Safety First:
- When in doubt, choose the less intrusive test approach
- Read-only operations are always preferred over write operations
- Tests that risk data corruption or customer confusion MUST be rejected or sandboxed

Resilience:
- Pin a small set of stable "anchor" elements (e.g., main navigation, logo, cart icon)
- Use flexible strategies for dynamic content (e.g., "any product in featured collection" not "product ID 12345")
- Provide fallback selectors with documented precedence

Human-Readable Reports:
- Test reports MUST include screenshots or video on failure
- Reports MUST use plain language descriptions, not just technical stack traces
- Evidence MUST be embedded or linked, not referenced obliquely

Minimal Configuration:
- Default configuration MUST work for local development and CI without modification
- Environment-specific overrides MUST be clearly documented
- Configuration keys MUST have descriptive names and inline documentation

**Rationale:** Overly aggressive testing damages stakeholder relationships. Content churn is inevitable; tests must adapt. Non-engineers (PMs, designers, stakeholders) need to assess results without engineering assistance. Complex configuration creates friction and errors.

---

### Principle 7: Trade-off Precedence

**When trade-offs arise, the order of precedence is safety, clarity, reliability, and only then breadth.**

1. **Safety:** Will this harm the live store, confuse customers, or risk compliance? If yes, reject or redesign.
2. **Clarity:** Can a non-engineer understand what this test does and why it failed? If no, simplify.
3. **Reliability:** Does this test pass consistently without flakiness? If no, fix or remove.
4. **Breadth:** Does this test cover a new scenario? Only pursue if safety, clarity, and reliability are satisfied.

**Rationale:** This hierarchy prevents the common trap of chasing coverage at the expense of usefulness. A test that is unsafe, unclear, or unreliable has negative value regardless of coverage.

---

### Principle 8: Risk Management

**Any change that increases risk to the live store or reduces report readability must include a mitigation and a rollback plan.**

Before introducing risky changes:
- Document the specific risk (e.g., "writes to cart state," "creates user account")
- Provide mitigation (e.g., "cleanup hook deletes cart items," "uses ephemeral sandbox account")
- Define rollback plan (e.g., "manual SQL deletion query," "restore from backup")
- Obtain explicit approval from project maintainer

Before reducing readability:
- Justify why existing clarity is insufficient
- Demonstrate that new approach provides compensating value
- Provide migration path for existing reports/artifacts

**Rationale:** Risk and clarity degradation compound over time. Requiring explicit justification and mitigation creates friction that prevents gradual erosion of principles.

---

## Governance

### Amendment Procedure

1. Propose amendment with:
   - Rationale referencing which principle(s) are in conflict or insufficient
   - Specific wording changes
   - Impact assessment on existing tests and templates
2. Discuss with stakeholders (minimum: project maintainer + 1 active contributor)
3. Update constitution with incremented version number
4. Update Sync Impact Report and propagate changes to dependent templates
5. Commit with message: `docs: amend constitution to vX.Y.Z (<summary>)`

### Versioning Policy

- **MAJOR (X.0.0):** Backward-incompatible principle removals or redefinitions requiring test rewrites
- **MINOR (0.X.0):** New principles added or material expansions to guidance
- **PATCH (0.0.X):** Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

- All new tests MUST reference this constitution in their initial PR
- Quarterly review of test suite alignment with principles
- Any principle violation MUST be documented as technical debt with remediation timeline

### Conflict Resolution

When principles conflict:
1. Escalate to project maintainer with short written rationale
2. Propose compromise that maintains "day-to-day confidence checks" utility
3. Document decision in amendment log
4. If compromise impossible, apply Trade-off Precedence order (Principle 7)

---

## Amendment Log

### v1.0.0 - 2025-10-11 (Initial Ratification)

Established foundational principles for live store E2E testing governance:
- Codified safety-first approach for testing live production environments
- Defined code quality and testing standards for maintainable test suites
- Specified user experience consistency baselines
- Set performance requirements for CI/CD integration
- Established decision-making hierarchy and risk management protocols

---

*This constitution is a living document. All specifications, plans, and implementations must reference these principles and explain how proposed changes support them.*
