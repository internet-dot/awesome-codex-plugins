# Disclaimer

> **READ THIS BEFORE USING THIS SKILL FOR ANY COMPLIANCE PURPOSE.**

The content in this repository is **engineering reference material**. It is **not legal advice**, **not professional advice**, and **not a substitute for consulting a qualified Data Protection Officer (DPO) or lawyer**.

By installing, accessing, viewing, or otherwise using this skill, you acknowledge that you have read and understood this disclaimer.

## What this skill is

- A working summary of personal-data-protection obligations as they apply to building and operating software systems in Singapore, Thailand, Indonesia, and Malaysia
- A set of layered patterns and checklists that engineers can use when designing features, schemas, and operational processes
- A collection of jurisdiction-specific notes mapping universal patterns to the relevant statute sections

## What this skill is **not**

- **Not legal advice.** No attorney–client, solicitor–client, or any other professional advisory relationship is created by your use of this skill. The maintainers and contributors are not licensed to practise law in Singapore, Thailand, Indonesia, Malaysia, or any other jurisdiction.
- **Not authoritative.** Where the content in this skill conflicts with the official statute, regulator guidance, or a court / regulator decision, **the official source wins.** The skill content is a summary written by engineers for engineers; it may be incomplete, inaccurate, or out of date.
- **Not a guarantee of compliance.** Following the patterns and checklists in this skill does not by itself make your application compliant with any statute. Compliance is a fact-specific determination requiring qualified review of your particular processing activities.
- **Not a substitute for professional review.** Decisions about whether your application complies with the law require the judgment of a qualified DPO, privacy counsel, or compliance professional who has reviewed your specific facts.
- **Not a review of contracts, internal processes, employee practices, vendor agreements, or regulatory filings.** This skill addresses code patterns, schema design, and engineering documentation only. Compliance has many surfaces; this skill covers one of them.
- **Not insurance.** This skill provides no indemnity, no warranty, and no compensation if you suffer loss in connection with its use.

## How this skill operates

- **Pure documentation.** This skill is a collection of markdown files. It contains no executable code, no scripts, no agents, and no scanners.
- **No data collection.** Reading or applying the skill does not transmit any source code, scan results, or usage information anywhere. Analysis runs entirely inside your local Claude Code session and your own repository.
- **No telemetry.** The maintainers do not receive any signal about who installs this skill, what projects it is applied to, or what findings it surfaces.
- If a downstream tool wraps this skill into a system that does collect or transmit data, disclosure of that collection is the downstream tool's responsibility, not this repository's.

## Use at your own risk

You accept full responsibility for any decision you make in reliance on this content. You agree that:

1. You will independently verify any statute citation, threshold, or obligation against the official source before relying on it.
2. You will engage a qualified DPO or lawyer before making compliance decisions that materially affect your obligations or your users' rights.
3. You will not represent or hold out this skill as authoritative legal advice to your users, your team, your investors, your regulators, or any other party.
4. You waive any claim against the maintainers and contributors of this repository arising from your use of, or reliance on, the content.

## Authoritative sources

When implementing or defending compliance work, always consult the official sources:

- **Singapore — Personal Data Protection Act 2012:**
  - Personal Data Protection Commission (PDPC): [www.pdpc.gov.sg](https://www.pdpc.gov.sg)
  - Statute on Singapore Statutes Online: [sso.agc.gov.sg/Act/PDPA2012](https://sso.agc.gov.sg/Act/PDPA2012)
- **Thailand — PDPA B.E. 2562 (2019):**
  - Personal Data Protection Committee Thailand (PDPC): [www.pdpc.or.th](https://www.pdpc.or.th)
- **Indonesia — UU PDP No. 27/2022:**
  - Komdigi (Kementerian Komunikasi dan Digital, formerly Kominfo)
  - Statute on the Indonesian state gazette portal: [peraturan.go.id](https://peraturan.go.id)
- **Malaysia — Personal Data Protection Act 2010 (Act 709) with the 2024 Amendments (Act A1727):**
  - Department of Personal Data Protection / Jabatan Perlindungan Data Peribadi (JPDP): [www.pdp.gov.my](https://www.pdp.gov.my)
  - Federal Legislation portal: [lom.agc.gov.my](https://lom.agc.gov.my)

The maintainers are not affiliated with, endorsed by, or speaking for any of these regulators.

## Currency and accuracy

Each jurisdiction file in this repo records the statute version it reflects and when it was last verified against official sources. Statutes amend. Subordinate regulations are issued. Regulator guidance evolves. Court and regulator decisions reinterpret. **Use the dates in each file to judge how much trust to extend to its content; never assume currency.**

If you discover content that is out of date or inconsistent with current statute / guidance, please open an issue or pull request — see [CONTRIBUTING.md](CONTRIBUTING.md). Reporting an issue does not create any obligation on the maintainers to fix it within any specific time, or at all.

## Contributors

Contributors to this repository warrant only that they have authored the content they submit and have the right to license it under the project's MIT licence. Contributors make no warranty as to the accuracy, completeness, or fitness for any particular purpose of their contributions. Neither the maintainers nor any individual contributor accepts liability arising from contributed content.

## Copyright in source materials

The MIT licence accompanying this repository ([LICENSE](LICENSE)) covers **only the original commentary, structure, organisation, layered framework, checklists, templates, and analysis** contributed by the maintainers and contributors. It does **not** purport to grant any rights in the underlying statutes, regulations, official translations, or regulator guidance.

Specifically:

1. **Statute texts and official translations remain the property of their respective governments / regulators / appointed publishers.** This includes (without limitation):
   - The Singapore Personal Data Protection Act 2012 and its subordinate regulations, published on Singapore Statutes Online and subject to the [SSO Terms of Use](https://sso.agc.gov.sg/Help/TermsOfUse).
   - The Thailand Personal Data Protection Act B.E. 2562 (2019) as published in the Royal Government Gazette, and any English translations published by PDPC Thailand subject to PDPC Thailand's own terms.
   - The Indonesia Undang-Undang No. 27 Tahun 2022 (Pelindungan Data Pribadi) as published on peraturan.go.id, and any official translations or guidance issued by Komdigi (formerly Kominfo).
   - The Malaysia Personal Data Protection Act 2010 (Act 709) and the Personal Data Protection (Amendment) Act 2024 (Act A1727), published by **Percetakan Nasional Malaysia Berhad (PNMB)** as Appointed Printer to the Government of Malaysia. **The PNMB-published PDFs carry a notably restrictive publisher's copyright notice** ("All rights reserved. No part of this publication may be reproduced, stored in a retrieval system or transmitted in any form or by any means electronic, mechanical, photocopying, recording and/or otherwise without the prior permission of Percetakan Nasional Malaysia Berhad"). This restriction is more explicit than the equivalents on SSO / PDPC Thailand / peraturan.go.id, and reusers should treat MY source-copyright posture as the strictest of the four when planning any redistribution.

2. **Verbatim quotations of statutory language reproduced in this skill are short operative phrases, cited and attributed to the official source, reproduced for educational and engineering-reference purposes under fair-dealing principles** (or the local equivalent doctrine in each jurisdiction — e.g., section 13 of the Malaysian Copyright Act 1987). The skill does not republish any statute in full and does not substitute for the official text.

3. **Anyone wishing to redistribute the verbatim quotations** beyond similar non-commercial educational or engineering-reference use, or to reproduce substantial portions of any statute, official translation, or regulator guidance, **must consult the originating regulator's or publisher's terms** (SSO, PDPC Thailand, Komdigi, PNMB / JPDP, etc.) and obtain permission where required. **For Malaysia in particular**, the PNMB notice expressly requires prior written permission for reproduction beyond fair-dealing — do not assume the SG / TH / ID model carries over. The MIT licence on this repository does not — and cannot — grant such rights on the regulators' or publishers' behalf.

4. **The maintainers make no representation** that the verbatim quotations are reproduced under any specific licence or with any specific permission from the regulators. The fair-dealing basis above is the maintainers' good-faith view, not a legal opinion or warranty.

If you are a representative of a regulator, rights-holder, or appointed publisher (PDPC, PDPC Thailand, Komdigi, PNMB, JPDP, or any other) and believe any verbatim quotation in this skill exceeds fair-dealing or other applicable exemption, please open an issue or contact the maintainers — see [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## Liability

The maintainers and contributors of this repository accept **no liability** for any decision made or action taken in reliance on this content. The MIT licence accompanying this repository contains the full warranty disclaimer and limitation of liability — see [LICENSE](LICENSE). To the maximum extent permitted by applicable law, the maintainers' and contributors' aggregate liability for any claim arising from your use of this skill is limited to **zero**.

## Jurisdiction of this disclaimer

This disclaimer is governed by the laws of Singapore, without regard to conflict-of-laws principles. Any dispute arising from or in connection with this disclaimer or the use of this skill shall be subject to the exclusive jurisdiction of the courts of Singapore.

## Changes to this disclaimer

The maintainers may update this disclaimer at any time without notice. The version in force at the time you use the skill is the version that applies. Continued use of the skill after a change constitutes acceptance of the change.
