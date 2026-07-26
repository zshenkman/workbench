# Smell Field Guide

Use this supporting reference during a broad Febreeze audit, when a candidate
smell is ambiguous, or when comparing structural remedies. It supplies
diagnostic questions, not mandatory rules. `SKILL.md` governs the workflow and
the files under `rules/` govern the resulting design.

A pattern is only a signal. Confirm a smell by showing how the structure creates
change amplification, coupled decisions, hidden invariants, defect risk, or
reader burden in the repository under review.

## Contents

- [Scattered decision](#scattered-decision)
- [Entangled responsibilities](#entangled-responsibilities)
- [Weak state model](#weak-state-model)
- [Misplaced ownership](#misplaced-ownership)
- [Implicit sequencing and partial state](#implicit-sequencing-and-partial-state)
- [Leaky boundary](#leaky-boundary)
- [Abstraction drag](#abstraction-drag)
- [Branch accretion](#branch-accretion)
- [Verification resistance](#verification-resistance)
- [Naming drift](#naming-drift)

## Scattered decision

**Signal:** One rule appears in multiple branches, files, layers, schemas, or
representations.

**Pressure:** A single policy change requires coordinated edits and can leave
the system internally inconsistent.

**Confirm:** Identify the shared decision and show that the copies must change
together.

**Reframe:** Give the decision one owner or derive the repeated representations
from one canonical model.

**Watch for:** Similar-looking code with different owners or reasons to change.
Do not create a mode-heavy abstraction merely to remove repetition.

## Entangled responsibilities

**Signal:** A file, module, function, or service changes for unrelated policies,
lifecycles, or dependencies.

**Pressure:** Independent changes interfere, tests require unrelated setup, and
callers gain knowledge they do not need.

**Confirm:** Name the distinct decisions and show that they change
independently.

**Reframe:** Move each decision to its natural owner and keep orchestration at
the boundary that coordinates them.

**Watch for:** Splitting by line count or technical kind. Cohesive behavior may
belong together even when it is large.

## Weak state model

**Signal:** Booleans, nullable fields, strings, casts, or option combinations
encode mutually exclusive states or conditional capabilities.

**Pressure:** Invalid states are representable and branches must reconstruct
the real domain model repeatedly.

**Confirm:** Enumerate the valid states and find combinations that are invalid,
ambiguous, or require defensive fallback.

**Reframe:** Model explicit variants, transitions, and invariants at the owner
of the state.

**Watch for:** Types that add ceremony without preventing misuse. A named
wrapper is useful only when it carries a real distinction.

## Misplaced ownership

**Signal:** Feature policy lives in a shared path, callers interpret another
module's internals, or several components coordinate one mutable value.

**Pressure:** Knowledge spreads outward and future changes cross boundaries.

**Confirm:** Identify the decision's natural owner and show which consumers know
details outside their responsibility.

**Reframe:** Move policy and state to the nearest owner that can enforce the
whole invariant; expose the smallest contract consumers need.

**Watch for:** Moving code to a central module that becomes a new catch-all.
Centralization is not ownership.

## Implicit sequencing and partial state

**Signal:** Correctness depends on call order, ambient setup, hidden mutation,
paired operations, or a sequence of updates that can stop halfway.

**Pressure:** Intermediate states leak, retries are unsafe, and failures leave
the system inconsistent.

**Confirm:** Trace initialization, success, failure, retry, and cleanup paths.
Show the invalid intermediate state or invisible temporal requirement.

**Reframe:** Give the lifecycle one owner, make transitions explicit, and make
related updates atomic or safely resumable.

**Watch for:** Adding a coordinator that only hides the same order dependency.
The invariant must become enforceable.

## Leaky boundary

**Signal:** Domain code knows transport, persistence, vendor, framework, cache,
or lifecycle details that do not change its policy.

**Pressure:** Infrastructure changes spread into callers and domain behavior
cannot be understood independently.

**Confirm:** Show the foreign detail and the domain decision it contaminates.

**Reframe:** Translate at the system boundary and expose a contract in the
consumer's vocabulary.

**Watch for:** Recreating an entire framework behind a private look-alike API.
Isolate only the boundary the application actually owns.

## Abstraction drag

**Signal:** A wrapper forwards arguments, an interface mirrors one concrete
type, a generic mechanism serves one concrete case, or a helper merely renames
syntax.

**Pressure:** Readers navigate more concepts without gaining policy, invariant
enforcement, substitution, or isolation.

**Confirm:** Remove the abstraction mentally and identify what useful contract
would be lost.

**Reframe:** Inline the indirection, collapse layers with one owner, or replace a
universal mechanism with explicit use-case variants.

**Watch for:** Removing a small interface that protects a volatile dependency or
meaningful boundary. Reuse count alone does not decide value.

## Branch accretion

**Signal:** New feature checks, exceptions, nullable modes, or one-off branches
appear inside an already general flow.

**Pressure:** Every new case multiplies possible paths and makes the default
behavior harder to see.

**Confirm:** Group branches by the hidden states or policies they encode.

**Reframe:** Change the state model, move policy behind its owner, or make each
variant an explicit composition.

**Watch for:** Centralizing conditionals without reducing them. A switch in one
file may only relocate the complexity.

## Verification resistance

**Signal:** Testing one behavior requires unrelated infrastructure, private
state manipulation, broad mocking, or production-only sequencing.

**Pressure:** Important behavior becomes expensive to verify and regressions
survive behind setup complexity.

**Confirm:** Identify the owning contract that cannot be exercised directly and
the unrelated machinery the test must construct.

**Reframe:** Expose behavior through the owner's real public contract and move
side effects to explicit boundaries.

**Watch for:** Production abstractions created only to expose internals to tests.
Testability should follow clearer ownership, not dictate artificial layers.

## Naming drift

**Signal:** One concept has several names, one name covers several concepts, or
a name exposes storage while hiding domain meaning, units, or lifecycle.

**Pressure:** Readers cannot reliably infer whether values share rules or may be
substituted.

**Confirm:** Trace each term to its owner, invariant, and lifecycle. Show the
ambiguity or false equivalence.

**Reframe:** Establish one accurate domain term per concept and migrate every
safely changeable use.

**Watch for:** Cosmetic renames that leave the model unchanged or create a
second active term for compatibility without a concrete need.
