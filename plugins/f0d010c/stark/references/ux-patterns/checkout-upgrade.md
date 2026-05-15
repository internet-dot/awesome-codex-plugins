# Checkout and upgrade pattern

Use for checkout, subscription upgrade, paywall, pricing comparison, plan selection, add-ons, credits, usage limits, or trial conversion.

## Applies when

- The user is deciding whether to pay, upgrade, or commit.
- Trust, risk, price clarity, and reversibility matter.
- The user may compare options or worry about hidden terms.

## Wrong when

- The product is only browsing/catalog without commitment.
- The flow is an internal approval flow rather than a customer purchase.

## Shipped-product signals to look for

- Total cost and billing period are visible near the CTA.
- The CTA says what happens and, when useful, includes price.
- Plan comparison emphasizes differences that change the decision.
- Objection-handling copy is close to the moment of concern: cancellation, refunds, renewal, usage limits.
- No surprise fees late in the flow.
- Risk reversal appears as a product benefit, not legal footnote.
- Confirmation state repeats what was purchased and what happens next.

## Failure prevented

Trust collapse at commitment. Users back out when pricing, renewal, cancellation, or consequences feel hidden.

## UX decision brief fields

- Pattern: short form + transparent cost/risk + recovery
- Primary action: choose/confirm purchase or upgrade
- Secondary actions: compare plans, change quantity, apply code, cancel, contact sales
- Required states: loading price, invalid payment, failed payment, tax/shipping unavailable, success, refund/cancel path
- Handoff constraints: keep cost/terms near CTA; do not bury cancellation or renewal copy
