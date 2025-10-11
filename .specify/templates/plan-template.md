# Plan: [FEATURE_OR_CHANGE_NAME]

**Created:** [YYYY-MM-DD]  
**Author:** [AUTHOR_NAME]  
**Status:** [Draft | In Review | Approved | Implemented]  
**Constitution Version:** 1.0.0

---

## Overview

### Problem Statement

[Describe the problem, gap, or opportunity this plan addresses. Be specific about user impact or technical debt.]

### Proposed Solution

[High-level description of the approach. Reference how it aligns with constitution principles.]

### Success Criteria

[Measurable outcomes that indicate successful implementation.]

---

## Constitution Compliance Check

This section ensures alignment with the [Project Constitution](../memory/constitution.md).

### Principle Alignment

| Principle | Compliance Status | Notes |
|-----------|------------------|-------|
| 1. Priority Hierarchy | ✅ ⚠️ ❌ | [How does this plan prioritize trust/clarity/maintenance?] |
| 2. Code Quality Standards | ✅ ⚠️ ❌ | [Are tests readable, deterministic, residue-free?] |
| 3. Testing Standards | ✅ ⚠️ ❌ | [Stable selectors, explicit waits, data hygiene?] |
| 4. UX Consistency | ✅ ⚠️ ❌ | [Does this maintain/improve core flow coverage?] |
| 5. Performance Requirements | ✅ ⚠️ ❌ | [Impact on smoke suite runtime?] |
| 6. Governance Decision Rules | ✅ ⚠️ ❌ | [Safety, resilience, report readability, minimal config?] |
| 7. Trade-off Precedence | ✅ ⚠️ ❌ | [Safety > Clarity > Reliability > Breadth order followed?] |
| 8. Risk Management | ✅ ⚠️ ❌ | [Mitigation and rollback plan if applicable?] |

### Risk Assessment

**Store Safety Risk:** [None | Low | Medium | High]

[If Medium or High: Describe specific risks and mitigation strategies.]

**Report Readability Impact:** [Improved | Unchanged | Degraded]

[If Degraded: Justify and provide compensating improvements.]

### Rollback Plan

[If this change introduces risk, describe how to quickly revert to previous state.]

---

## Technical Design

### Architecture

[Component diagram, sequence diagram, or written description of technical approach.]

### Selector Strategy

[For UI testing changes: Document selector approach, fallback strategy, and stability justification.]

### Wait & Synchronization Strategy

[For UI testing changes: How will tests wait for readiness? What conditions signal completion?]

### Data Hygiene Plan

[For tests that modify state: How will cleanup happen? What guarantees deterministic execution?]

---

## Implementation Phases

### Phase 1: [PHASE_NAME]

- **Duration:** [Estimated time]
- **Deliverables:** [Specific outputs]
- **Dependencies:** [Prerequisites or blockers]
- **Validation:** [How to verify phase completion]

### Phase 2: [PHASE_NAME]

[Repeat as needed]

---

## Testing & Validation

### Test Scope

- [ ] Unit tests (if applicable)
- [ ] Integration tests (if applicable)
- [ ] E2E smoke tests (required for UI changes)
- [ ] Performance benchmarks (if runtime changes expected)

### Acceptance Criteria

1. [Specific, measurable criterion]
2. [...]

---

## Documentation Updates

- [ ] Update README if user-facing changes
- [ ] Update inline code comments for complex logic
- [ ] Update test documentation if new patterns introduced
- [ ] Update constitution if new principle identified (requires amendment procedure)

---

## Open Questions

[List unresolved questions that need stakeholder input.]

---

## Approvals

- [ ] Project Maintainer: [NAME] on [DATE]
- [ ] Active Contributor Review: [NAME] on [DATE]
- [ ] Constitution Compliance Verified: [NAME] on [DATE]

---

## Amendment Log

[Track significant changes to this plan after initial draft.]

- **[YYYY-MM-DD]:** [Change description] - [Author]
