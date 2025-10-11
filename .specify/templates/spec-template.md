# Specification: [FEATURE_OR_TEST_NAME]

**Created:** [YYYY-MM-DD]  
**Author:** [AUTHOR_NAME]  
**Status:** [Draft | In Review | Approved | Implemented]  
**Constitution Version:** 1.0.0  
**Related Plan:** [Link to plan document if applicable]

---

## Purpose

[One paragraph explaining what this spec defines and why it's needed. Reference constitution principles it supports.]

---

## Scope

### In Scope

- [Specific behavior, component, or flow covered]
- [...]

### Out of Scope

- [Explicitly excluded items to prevent scope creep]
- [...]

---

## Requirements

### Functional Requirements

#### FR1: [REQUIREMENT_NAME]

**Priority:** [Must Have | Should Have | Nice to Have]  
**Constitution Principle:** [Reference principle number(s)]

**Description:**  
[Detailed description of the requirement]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [...]

**Rationale:**  
[Why this requirement exists and how it supports constitution principles]

---

### Non-Functional Requirements

#### NFR1: [REQUIREMENT_NAME]

**Type:** [Performance | Security | Maintainability | Reliability | Usability]  
**Constitution Principle:** [Reference principle number(s)]

**Description:**  
[Detailed description]

**Measurable Target:**  
[Specific metric, e.g., "Completes in < 30 seconds", "Passes 10 consecutive runs without flake"]

**Rationale:**  
[Why this requirement exists]

---

## Technical Specification

### Selector Definitions

[For UI tests: Define stable selectors with fallback strategies]

| Element | Primary Selector | Fallback Selector | Stability Justification |
|---------|-----------------|-------------------|------------------------|
| [Element name] | `[selector]` | `[fallback]` | [Why this is stable] |

### Wait Conditions

[For UI tests: Define explicit wait conditions]

| Action | Wait Condition | Timeout | Failure Message |
|--------|---------------|---------|-----------------|
| [Action name] | [Condition] | [ms] | [Clear error message] |

### State Management

[For tests that modify state: Define setup, execution, and teardown]

```
Setup:
1. [Initial state preparation]
2. [...]

Execution:
1. [Test steps]
2. [...]

Teardown:
1. [Cleanup steps]
2. [Verification cleanup succeeded]
```

---

## Data Strategy

### Test Data Requirements

- **Type:** [Static | Dynamic | Generated]
- **Source:** [Fixture file | API | Live store]
- **Hygiene:** [Read-only | Temporary with cleanup | Persistent (justify)]

### Data Constraints

- [Specific constraints or invariants that must hold]
- [...]

---

## Evidence & Reporting

### Success Evidence

[What artifacts prove this requirement is met?]

- [ ] Screenshots showing [specific state]
- [ ] Video recording of [flow]
- [ ] Logs confirming [behavior]
- [ ] Metrics showing [performance target met]

### Failure Evidence

[What should be captured on failure?]

- [ ] Screenshot at failure point
- [ ] Full page HTML
- [ ] Console logs
- [ ] Network request logs
- [ ] Human-readable error message explaining what went wrong

---

## Risk & Mitigation

### Identified Risks

#### Risk 1: [RISK_DESCRIPTION]

**Likelihood:** [Low | Medium | High]  
**Impact:** [Low | Medium | High]  
**Constitution Principle Violated:** [If applicable]

**Mitigation:**  
[How this risk will be addressed]

**Rollback Plan:**  
[How to revert if mitigation fails]

---

## Edge Cases & Content Churn Resilience

[How will this spec handle expected variations in live store content?]

- **Product availability changes:** [Strategy]
- **Promotional content rotation:** [Strategy]
- **Theme/layout updates:** [Strategy]
- **Inventory fluctuations:** [Strategy]

---

## Dependencies

### Internal Dependencies

- [Other specs, components, or tests this depends on]
- [...]

### External Dependencies

- [Third-party services, APIs, or infrastructure]
- [...]

---

## Open Questions

[Unresolved questions needing stakeholder input before implementation]

1. [Question]
2. [...]

---

## Approval Checklist

- [ ] All requirements mapped to constitution principles
- [ ] Risk assessment completed with mitigation plans
- [ ] Selector stability justified
- [ ] Wait conditions explicitly defined
- [ ] Data hygiene strategy documented
- [ ] Evidence collection defined for success and failure
- [ ] Edge cases and content churn resilience addressed
- [ ] Project Maintainer approved: [NAME] on [DATE]

---

## Implementation Notes

[Space for implementers to add notes during development. Do not pre-populate.]

---

## Validation Results

[After implementation: Record validation evidence]

- **Test Run Date:** [YYYY-MM-DD]
- **Environment:** [Local | CI | Staging | Production]
- **Result:** [Pass | Fail]
- **Evidence:** [Link to screenshots, videos, logs]
- **Validated By:** [NAME]

---

*This specification must align with the [Project Constitution](../memory/constitution.md). Any conflicts should be escalated per Principle 8.*
