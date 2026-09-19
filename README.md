# How do large language models work?

A comprehensive guide to LLMs — from tokenization through backpropagation to the
research frontier of mechanistic interpretability. Written in Hungarian, with a
full English edition.

**➜ [Read it in English](https://csaplard.github.io/llm-oktatoanyag/en/)** · **[Olvasd magyarul](https://csaplard.github.io/llm-oktatoanyag/)**

## What this is

A single, self-contained HTML file. No build, no dependencies, no framework —
download it, double-click it, it works. Offline too.

Choose **free reading** (the default) or **guided learning**. Free reading opens
all chapters without granting quiz credit. Guided learning unlocks the next
stage after four correct answers out of five. Both modes preserve existing quiz
results. Explanations appear for correct and incorrect answers alike.

Version 1.1 adds **14 interactive experiments**, worked mathematical foundations
and a **12-week practice path** with local checklists. The original temperature
demo remains available too. The experiments calculate actual results in your
browser; hand-built teaching models are explicitly distinguished from measured
LLM behavior.

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

Depth labels (intuition, mathematics, research) are separate from progression
stages. Foundation help provides worked examples for vectors, matrices,
probabilities, logarithms, derivatives, the chain rule and tensor shapes.

### The twelve learning stages

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
(`localStorage`); nothing is sent to a server. Existing quiz data keeps its
original `llm-oktato-progress-v1` key. Reading mode and weekly checklist data use
separate keys, so opening chapters or completing a weekly task never awards
quiz credit. If you disable storage or read in
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

- Each language edition is a self-contained HTML file, with all new CSS and
  JavaScript bundled inline. Use a current evergreen browser.
- No runtime dependencies, API keys, inference costs or external fonts.
- Authoring modules live in `src/`; `python3 scripts/build.py` regenerates the
  marked inline blocks in both editions. Original editorial content remains
  directly editable in each HTML file.
- 13 original SVG figures plus 14 new interactive experiments, with no external
  image dependencies.
- Light and dark mode with separately designed palettes (dark is not an inversion
  of light). Default: light.

## Languages

The material is available in Hungarian and English, with the same learning system
and the same quizzes. Switch between the two with the `HU` / `EN` button in the
bottom-right corner. Progress is shared: change language halfway through and you
do not have to start over.

The English edition is not a literal translation where that would have been
meaningless: the linguistic examples were replaced with ones that also work in
English — BPE vocabulary building uses `play / playful / playtime`, polysemy uses
`bank` (riverside or financial institution), the attention example uses `crane`
(bird or lifting machine). The geometry of the figures is identical in both
editions.

## Experiments

BPE merge steps · vector direction and length · matrix transformations · softmax
and entropy · causal attention · gradient descent · scalar backpropagation ·
residual addition · LayerNorm/RMSNorm · RoPE · KV-cache memory · superposition ·
activation patching · binary preference training.

Each experiment includes labeled keyboard-operable controls, calculated values,
a reset button, a challenge and an explanation of the example’s assumptions.

## Development and verification

```sh
npm ci
python3 scripts/build.py
npm test
```

Node is needed only for development tests; Python 3 builds the self-contained
HTML editions. The tests check mathematical invariants and finite-difference
gradients, every experiment control at its bounds in both languages, free/guided
reading behavior, progress preservation, local-storage failure, links and
bundled-source consistency. DOM tests do not replace browser visual checks.

Editing workflow: change original article/quiz content in `index.html` and
`en/index.html`, edit new learning components under `src/`, then run the build
and tests. Do not hand-edit the generated `LEARNING-CSS` and `LEARNING-JS` blocks.

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —
attribution · non-commercial · share alike. Details: [LICENSE](LICENSE).

© 2026 Dániel Csaplár · csaplar.d@gmail.com
