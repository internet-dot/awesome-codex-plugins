# Addenda — rules added from usage experience

Rules below were NOT part of the initial distillation from 16 canonical sources.
They emerged from real editorial practice and are supported by academic references.
Kept separate for traceability: original corpus vs. experiential additions.

---

## AD-1. Excessive em dashes (избыточные тире)

**Problem:** multiple em dashes in a paragraph create choppy rhythm, monotony, and an affected (mannered) tone.

**Sources:**
- Chekhov: «Поменьше употребляйте курсивов и тире — это манерно»
- Rozental "Практическая стилистика": dashes should serve clear semantic function, not be default punctuation
- Gramota.ru: some writers abuse dashes; the 1956 Rules of Russian Orthography note both extremes
- Gorky, Dostoevsky used excessive dashes as INTENTIONAL literary device — not a model for non-literary prose
- Milchin/Cheltsova: restraint in editorial formatting

**Rules:**

AD-1.1. Limit to 1–2 em dashes per paragraph in non-literary prose. Three or more is a signal to restructure.

AD-1.2. Never use em dashes as default punctuation when a more precise mark exists:
- Explanation/enumeration → colon `:`
- Stronger pause between independent clauses → semicolon `;`
- Aside/clarification → parentheses `()`
- Complex sentence → restructure into two sentences

AD-1.3. Consecutive sentences with em dashes = monotonous pattern. Vary punctuation across sentences.

AD-1.4. "Dash between subject and predicate" (тире между подлежащим и сказуемым) is often skippable in conversational register — Rozental notes it's usually NOT placed in simple conversational-style sentences.

AD-1.5. Test for "mannered" tone (манерность): read aloud. If dashes create a staccato rhythm that feels artificial, replace some with other constructions.

**Replacement strategies:**

| Pattern with dash | Alternative | When to use alternative |
|---|---|---|
| Москва — столица России | Москва, столица России, … | Appositive, not emphasis |
| Это — важно | Это важно | No emphasis needed, conversational |
| Он пришёл — и замолчал | Он пришёл и замолчал | No dramatic pause needed |
| Результат — рост продаж | Результат: рост продаж | Explanation follows |
| Всё готово — можно начинать | Всё готово; можно начинать | Two independent clauses |
| Скилл — набор правил — помогает | Скилл (набор правил) помогает | Aside, not emphasis |

---

## AD-2. Excessive parcellation (избыточная парцелляция)

**Problem:** splitting a single clause into several independent fragments for dramatic effect produces a choppy, affected rhythm typical of online copywriting. Parcellation is a legitimate stylistic device (Розенталь, «Справочник», ГЛАВА L) — the issue is overuse in registers where it does not fit.

**Sources:**
- Розенталь Д. Э. «Справочник по правописанию и стилистике», ГЛАВА L — parcellation as a stylistic figure of expressive syntax
- `info-style.md` section D: sentences should be compact but carry full meaning; parcellation is «неуместна» in info-style
- See also AD-1: analogous staccato-rhythm diagnosis for em dashes

**Rules:**

AD-2.1. In informational, UX, and business-writing registers: merge parcellated fragments back into a single clause with appropriate conjunctions or punctuation.

AD-2.2. In publicism: 1–2 parcellated constructions per article are acceptable as a rhythmic device; more signals overuse.

AD-2.3. In literary/artistic prose: parcellation is a legitimate author's device and is not penalized.

AD-2.4. Diagnostic test: read aloud. If several consecutive sentences are subject-less fragments or single-phrase rebuttals, the rhythm is staccato and likely excessive.

**Examples (info-style / UX / business context):**

| Wrong | Correct |
|---|---|
| Не шум и не артефакт. Воспроизводимый механизм. | И это не шум или артефакт, а воспроизводимый механизм. |
| Не потому что злой умысел. А потому что невозможно. | …не из-за злого умысла, а потому что это невозможно. |
| Расскажу последовательно, доступно, без воды. | Постараюсь объяснить доступным языком. |
| Это было не случайно. Это было продумано. Каждое слово. | Это было не случайно — каждое слово продумано. |

**Severity:** Low. Secondary signal in the **С — Structure** dimension (supporting **Ч — Clarity**). Cannot trigger non-compensatory caps alone.

**Acknowledged:** proposed by @V8-Software in issue #9 (2026-04-16).

---

## AD-3. Patronizing explanation (разжёвывание очевидного)

**Problem:** explaining what the context has already conveyed treats the reader as unable to make simple inferences. Over-explanation lowers pace, lowers trust, and adds words without information.

> **Not to be confused with** *примитивизация* as used in `info-style.md` section A, point 2: «Сокращение — забота о читателе, **не примитивизация**.» There «примитивизация» means oversimplification at the cost of meaning (e.g., removing necessary qualifiers). This rule concerns the opposite failure: redundant explanation of what the sentence has already conveyed. Both rules defend reader intelligence — from different directions.

**Sources:**
- Editorial practice around «respect the reader's intelligence»: cf. N. Gal, Ilyakhov
- Over-explaining in writing: liminalpages.com, writing.codidact.com/posts/75048
- `info-style.md` section A, point 2 — companion principle (against the opposite failure)

**Rules:**

AD-3.1. If a sentence already conveys a fact, do not immediately re-state it in a simpler metaphor or reformulation.

AD-3.2. Numeric comparisons that are self-evident to the reader do not need verbal paraphrase.

AD-3.3. Qualifiers like «то есть», «другими словами», «проще говоря» are warning signs — verify that the following clause actually adds information, not just rewords the preceding one.

**Examples:**

| Wrong | Correct |
|---|---|
| Конверсия выросла с 2% до 8%, то есть стала в четыре раза больше. | Конверсия выросла с 2% до 8%. |
| Мы сократили расходы на 30% — это почти треть бюджета. | Мы сократили расходы на 30%. |
| Пользователи тратят 12 минут, другими словами, больше десяти. | Пользователи тратят 12 минут. |

**Severity:** Low. Secondary signal in the **Ч — Clarity** dimension. Cannot trigger non-compensatory caps alone.

**Acknowledged:** proposed by @V8-Software in issue #9 (2026-04-16) as «Примитивизация»; renamed to avoid terminological collision with `info-style.md` A.2.

---

## AD-4. Unprovoked rebuttal (возражение без предпосылок)

**Problem:** constructions like «а это уже…», «но на самом деле…», «однако в реальности…» presuppose a prior claim that the writer is now refuting. When no such claim exists in the preceding text, the rebuttal invents an imaginary opponent and creates a non-existent conflict (cf. straw man / non-sequitur).

**Sources:**
- Straw-man fallacy and non-sequitur: Grammarly; Scribbr; Excelsior Online Writing Lab
- Rhetorical concept of «ритор и оппонент, реальный или фиктивный»: HSE «Риторика» (nnov.hse.ru)

**Trigger constructions:**

- «а это уже [нечто важное/серьёзное]»
- «но на самом деле…», «на самом-то деле…»
- «однако в реальности…», «однако на практике…»
- «но при этом нужно понимать, что…»
- «только вот…»

**Rules:**

AD-4.1. Before any adversative construction, verify that the preceding text (within the same section or 1–2 paragraphs back) contains a claim that is actually being rebutted.

AD-4.2. If no antecedent exists, rewrite as a direct positive statement — remove the pseudo-rebuttal scaffolding.

AD-4.3. Legitimate use: rebutting a cited source, an earlier paragraph of the same text, or a reader expectation that the context makes explicit.

**Examples:**

| Wrong | Correct |
|---|---|
| …а это уже реальный сценарий, в котором модели постоянно обучают друг друга. | …данных, которыми модели постоянно обучают друг друга. |
| Но на самом деле алгоритм обрабатывает 10 000 запросов в секунду. | Алгоритм обрабатывает 10 000 запросов в секунду. |
| Однако в реальности пользователь открывает приложение раз в день. | Пользователь открывает приложение раз в день. |

**Severity:** Low. Secondary signal in the **С — Structure** dimension (supporting **Ч — Clarity**). Cannot trigger non-compensatory caps alone.

**Acknowledged:** proposed by @V8-Software in issue #9 (2026-04-16).

---

## AD-5. Subject-predicate semantic mismatch (семантическое несоответствие субъекта и предиката)

**Problem:** using a predicate whose semantics imply volition, consciousness, resistance, or goal-directed intent, applied to a subject that has none of these. A narrow subset of the broader phenomenon of lexical-semantic compatibility (лексическая сочетаемость / семантическая валентность — Текстология.ру; studme.org).

**Scope restriction (important):** this rule targets only cases where the mismatch creates a **false implication of will, consciousness, resistance, or intent**. It does **not** condemn technical or mathematical personification that has become normative terminology.

**Sources:**
- Лексическая сочетаемость и семантическая валентность: Текстология.ру; studme.org/43201; sci.house/russkiy-yazyik
- Antropomorphism as a recognized cognitive/linguistic phenomenon: Большая Российская Энциклопедия, article «Антропоморфизм»

**Rules:**

AD-5.1. Do not use verbs implying conscious will, resistance, or goal-seeking for subjects that lack them (abstract entities, software without an agent, inanimate processes in non-technical prose).

AD-5.2. **Exception — normative technical terminology.** In mathematical, algorithmic, ML, and general technical writing, the following are legitimate and do not trigger this rule:

  - сходимость алгоритма, последовательность сходится
  - алгоритм стремится к оптимуму / к пределу (mathematical «limit» sense)
  - модель обучается, сеть обучается
  - программа / система принимает решение
  - память компьютера, ответ системы, запрос пользователя

  Rule of thumb: if a domain textbook uses the construction, it is terminology, not anthropomorphism.

AD-5.3. Apply the diagnostic: would a reader infer conscious will or resistance from the predicate? If yes and the subject lacks these properties, rewrite. If the predicate is a technical term or a well-established metaphor (already catalogued in domain usage), leave it.

**Examples:**

| Wrong | Correct | Why |
|---|---|---|
| Модель заставили генерировать числа. | Модели дали задачу генерировать числа. | «заставить» presupposes will to resist |
| Программа не хочет сохранять файл. | Программа не может сохранить файл / отказывается сохранять файл. | «хотеть» implies conscious desire |
| Модель осознала ошибку и исправилась. | Модель выдала ошибку и на следующей итерации — корректный результат. | «осознание» implies reflective consciousness |

**Counter-examples (do NOT flag):**

| Acceptable | Reason |
|---|---|
| Алгоритм стремится к оптимуму. | Standard optimization terminology (mathematical limit sense). |
| Градиентный спуск сходится к локальному минимуму. | Standard calculus/optimization term. |
| Машина решает задачу за 3 секунды. | Established technical usage (БРЭ «Антропоморфизм»: «в технической литературе антропоморфное употребление понятий основано на объективном сходстве»). |
| Сеть обучается на 10 000 примеров. | Standard ML terminology. |

**Severity:** Low. Secondary signal in the **Ч — Clarity** dimension (supporting **Г — Grammar**), with explicit technical-context exception. Cannot trigger non-compensatory caps alone.

**Acknowledged:** proposed by @V8-Software in issue #9 (2026-04-16) with the example «Алгоритм стремится → Алгоритм становится». That example is preserved here as a *counter-example* illustrating the exception boundary, per deep-research review of mathematical and ML usage norms.
