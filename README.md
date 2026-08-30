# How do large language models work?

A comprehensive guide to LLMs — from tokenization through backpropagation to the
research frontier of mechanistic interpretability. Written in Hungarian, with a
full English edition.

**➜ [Read it in English](https://csaplard.github.io/llm-oktatoanyag/en/)** · **[Olvasd magyarul](https://csaplard.github.io/llm-oktatoanyag/)**

## What this is

A single, self-contained HTML file. No build, no dependencies, no framework —
download it, double-click it, it works. Offline too.

The material is a **level-based learning system**: twelve levels, each closing
with a five-question quiz. The next chapter opens once you have answered four of
the five correctly. On a fail you can retry without limit, and the explanation
appears **for correct and incorrect answers alike** — the quiz is there to teach,
not to examine.

The questions deliberately ask about consequences rather than definitions: why
the model miscounts the letters in a word, why the same sentence costs more
tokens in Hungarian than in English, what happens when a token's embedding stays
untrained.

### Layered depth

Every topic is told three times, each time deeper:

| Layer | Where | What |
|---|---|---|
| 1 · intuition | the main text | what happens, and why |
| 2 · mathematics | collapsible block | the formulas, precisely |
| 3 · research depth | collapsible block | open questions, with references |

Read only the main text and you still get a complete, self-contained treatment.

### The twelve levels

1. What is a large language model?
2. Tokenization
3. Embeddings
4. Transformer: residual stream, attention
5. Transformer: MLP, normalization, positional encoding, output head
6. Training: loss, computation graph, backpropagation
7. Training: optimizers, infrastructure, scaling laws
8. Fine-tuning and alignment
9. Inference
10. Interpretability: the residual stream view, induction heads
11. Interpretability: superposition, sparse autoencoders, methodology
12. Capabilities and limits

Plus a glossary, a bibliography and a changelog — these stay open throughout and
are never locked.

## Data

Your **learning progress stays exclusively in your own browser**
(`localStorage`); nothing is sent to a server. If you disable storage or read in
a private window, everything still works — it just will not remember.

The page runs a cookie-free, IP-free visit counter
([GoatCounter](https://www.goatcounter.com/)) that counts page views only. Nobody
sees your quiz results.

## Accessibility

- Every text/background pair meets the WCAG 2.1 AA contrast requirement, in both
  light and dark mode (28 measured pairs).
- State is never carried by color alone: an icon and a text label mark it too.
- Fully keyboard-navigable; the content of locked chapters is `inert`, so Tab
  cannot wander into it.
- Under `prefers-reduced-motion` every animation stops, while the states remain
  distinguishable.

## Technical note

- One file, ~330 KB. Vanilla JS, IIFE, `var`/`function` — deliberately
  conservative, so it starts in any browser.
- 13 hand-made SVG figures, no external image files.
- Light and dark mode with separately designed palettes (dark is not an inversion
  of light). Default: light.

## Languages

The material is available in Hungarian and English, with the same level system
and the same quizzes. Switch between the two with the `HU` / `EN` button in the
bottom-right corner. Progress is shared: change language halfway through and you
do not have to start over.

The English edition is not a literal translation where that would have been
meaningless: the linguistic examples were replaced with ones that also work in
English — BPE vocabulary building uses `play / playful / playtime`, polysemy uses
`bank` (riverside or financial institution), the attention example uses `crane`
(bird or lifting machine). The geometry of the figures is identical in both
editions.

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —
attribution · non-commercial · share alike. Details: [LICENSE](LICENSE).

© 2026 Dániel Csaplár · csaplar.d@gmail.com
