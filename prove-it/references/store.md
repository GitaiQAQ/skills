# Checkpoint Store

Read this reference only when creating `.prove-it/checkpoints.yaml` or repairing a Store after `prove-it check` reports `store_invalid`.

## Canonical shape

The Store is strict YAML. Use two-space indentation, no tabs, and no aliases, anchors, tags, or multi-document streams. The CLI rewrites it into a stable, quoted form after the first successful mutation.

```yaml
# Managed by prove-it.
# Normal operation: use the CLI; do not read or edit this file directly.
# Repair mode: direct inspection and minimal edits are allowed only after
# `prove-it check` reports store_invalid.
schema: "prove-it/v1"
story:
  id: "e2e-performance-pilot"
  goal: "Show which representative performance scenarios are actually proved."
  refs:
    - ".unlazy/e2e-performance/PLAN.md"
dimensions:
  objective:
    - "creation"
  entity:
    - "campaign"
  entry:
    - "list"
  action:
    - "submit"
  metric:
    - "tti"
facets:
  runner: "The execution completed normally."
  page: "The action occurred on the expected page."
  action: "The intended action actually occurred."
  metric: "The metric is valid and belongs to this action."
  business: "The business outcome is correct."
  cleanup: "Created test resources were cleaned up."
checkpoints:
  - id: "creation.campaign.list.submit.tti"
    at:
      objective: "creation"
      entity: "campaign"
      entry: "list"
      action: "submit"
      metric: "tti"
    facets:
      runner:
        state: "open"
        notes: []
        refs: []
      page:
        state: "open"
        notes: []
        refs: []
      action:
        state: "open"
        notes: []
        refs: []
      metric:
        state: "open"
        notes: []
        refs: []
      business:
        state: "open"
        notes: []
        refs: []
      cleanup:
        state: "open"
        notes: []
        refs: []
    notes: []
    refs: []
```

## Structural rules

- `schema` is exactly `prove-it/v1`.
- Story, Dimension, Dimension value, Facet, and Checkpoint ids use lowercase letters, digits, `_`, or `-`; a Checkpoint id joins its coordinate values with `.` in Dimension order.
- `story` accepts `id`, `goal`, and optional `refs` only.
- `dimensions` and `facets` are non-empty mappings with unique ids.
- Every Dimension has at least one unique value.
- The Checkpoint list is exactly the Cartesian product of all Dimension values. There are no missing, duplicate, or foreign coordinates.
- Every Checkpoint contains exactly the declared Facets.
- Facet state is one of `open`, `satisfied`, `blocked`, or `not_applicable`.
- `notes` and `refs` are arrays of non-empty strings. Refs are not resolved or checked for existence.
- Unknown fields fail validation.

The explicit Cartesian surface intentionally keeps invalid combinations visible. Mark all Facets of such a Checkpoint `not_applicable` with a concise note instead of removing the Checkpoint.

## Repair boundary

Normal CLI writes are locked, compare the caller's `--from` value, validate the complete Store, and replace the YAML atomically. If parsing or validation fails, no mutation is attempted.

When repairing directly:

1. run `prove-it check` and keep its exact issue list;
2. inspect only the reported Store region plus the definitions it references;
3. preserve the Dimension product and stable ids;
4. make the smallest edit that restores structure;
5. rerun `prove-it check` before any other operation.

Do not treat a broken Ref as Store corruption. Do not use repair mode to alter a legitimate proof conclusion or to shrink the denominator.
