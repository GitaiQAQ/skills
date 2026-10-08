---
name: prove-it
description: Maintain a structured multidimensional Checkpoint surface so Agents cannot hide unexamined combinations or treat partial execution as proof. Use for exhaustive audits, migrations, test matrices, cross-product validation, and long tasks whose acceptance depends on several independent dimensions. Do not use it as an execution scheduler or as a replacement for a domain's authoritative result store.
---

# Prove It

Make the complete proof surface visible. Keep execution order in the Host or Unlazy; Prove It owns only structured Checkpoints and their current Facet states.

In commands below, `prove-it` means:

```text
node <this-skill-directory>/scripts/prove-it.mjs
```

## Model the proof surface before execution

Create `.prove-it/checkpoints.yaml` only when the task has an independently meaningful multidimensional denominator. Read [references/store.md](references/store.md) when creating or repairing the Store.

- A **Story** states the task-level result in one sentence.
- **Dimensions** identify the complete Cartesian surface.
- A **Checkpoint** is one stable coordinate tuple in that surface.
- **Facets** are the independent conditions that must hold for one Checkpoint. They prevent a runner pass, metric, business result, or cleanup result from standing in for the others.
- **Notes** retain concise continuation context.
- **Refs** are optional breadcrumbs. They may point to Unlazy files, Agent Notes, code, logs, or domain artifacts. Never require or resolve them to validate the Store.

Generate every Cartesian Checkpoint before doing the work, then run `prove-it check`. Keep invalid or inapplicable combinations in the denominator and mark their Facets `not_applicable`; never delete them to improve counts.

## Keep normal access on the CLI

During normal work, do not read, search, or edit `.prove-it/checkpoints.yaml` directly. Use only CLI projections:

```text
prove-it
prove-it show <checkpoint>
prove-it find [--state <state>] [--dimension <name=value>]...
              [--facet-state <facet=state>] [--has-note] [--has-ref]
prove-it check
```

Prove It does not choose the next Checkpoint, split rows or blocks, assign Agents, retry work, or record attempts. The caller selects work and asks for only the necessary slice.

## Record one precise result at a time

Use a result-specific command; never patch a generic state field:

```text
prove-it satisfy <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
prove-it block <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
prove-it not-applicable <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
prove-it reopen <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
prove-it note <checkpoint> [facet] [--text <text>] [--ref <location>]...
```

`--from` is a compare-and-set guard, not a workflow transition. A conclusion may be revised in either direction when new information appears. If it conflicts with the current state, reread the Checkpoint and reconsider; never force the update.

Write one short factual note. Put long reasoning in an Agent Note and add it with repeatable `--ref`. A Ref is navigation metadata, not evidence validation.

## Interpret status honestly

Checkpoint status is derived from its Facets:

- any `blocked` Facet -> `blocked`;
- otherwise any `open` Facet -> `open`;
- all Facets `not_applicable` -> `not_applicable`;
- otherwise -> `satisfied`.

Execution success is not proof. Do not use Checkpoint state to supersede a domain's canonical Facts, Ledger, test oracle, or business result. Where a domain verifier exists, run it before recording `satisfied` and describe the observed basis in the note.

Before reporting, run `prove-it check`, inspect the summary, and state the measured `satisfied`, `open`, `blocked`, and `not_applicable` counts separately. Do not collapse them into a confidence score or claim completion while required Checkpoints remain open or blocked.

## Enter repair mode only on Store failure

If `prove-it check` reports `store_invalid`, all mutation commands fail closed. Only then may you read `.prove-it/checkpoints.yaml`, inspect the reported region, and make the smallest direct repair. Rerun `prove-it check` immediately. Once valid, return to CLI-only access.

Do not use repair mode to change scope, rewrite conclusions, or bypass command validation. It is an escape hatch for malformed or internally inconsistent storage.
