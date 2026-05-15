# Activation onboarding pattern

Use when a user is new and must reach first value: setup flows, import flows, workspace creation, trial activation, first project creation, or profile/account setup.

## Applies when

- The user does not yet know whether the product is worth effort.
- The product needs setup before value appears.
- The flow has optional information that can be deferred.

## Wrong when

- The user is already expert and wants repeated speed.
- The product can show value immediately without setup.

## Shipped-product signals to look for

- First screen explains the concrete outcome, not the feature list.
- Required steps are visibly fewer than optional steps.
- Skip/resume exists for low-risk fields.
- Imported/demo/sample data can show value before full setup.
- Progress is meaningful, not decorative.
- Permissions are requested at the moment of need, with a concrete reason.
- Success state points to the next valuable action.

## Failure prevented

Long forms before value. Users drop when they pay setup cost before understanding the reward.

## UX decision brief fields

- Pattern: guided setup with skip/resume
- Primary action: reach first meaningful result
- Secondary actions: skip optional step, import data, use sample data, resume later
- Required states: no workspace, import running, import failed, permission denied, setup partial, first success
- Handoff constraints: do not force account/profile completion before value unless legally required
