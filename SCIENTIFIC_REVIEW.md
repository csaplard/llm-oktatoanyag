# Szakmai ellenőrzés / Scientific review — v1.1.1

Dátum / Date: 2026-09-19.

A v1.1 kiadás tartalmi átnézése során tényleges hibák és túl erős állítások is előkerültek. Az alábbi javítások a magyar és az angol kiadásban egyaránt szerepelnek. Az ellenőrzés nem független tudományos lektorálás és nem bizonyítja minden mondat hibátlanságát.

The review found factual errors and overstatements in v1.1. Corrections apply to both editions. This is a source-backed editorial and mathematical review, not independent academic peer review or a guarantee that every statement is error-free.

## Hatókör / Scope

- 12 tanulási állomás / learning stages, 60 kvízkérdés / quiz questions.
- 5 matematikai alapozó és a 12 hetes útvonal feladatai / five foundations and the 12-week practice path.
- 14 labor számítási kódja, eredményei és egyszerűsítései / computational code, outputs and assumptions of 14 labs.
- A statikus ábrák állításai és a magyar–angol megfelelés / claims in static figures and bilingual consistency.

## Lényeges javítások / Material corrections

| Terület / Area | Javítás / Correction |
| --- | --- |
| Kauzális attention | A korábbi token nem olvashat későbbi szöveget; saját pozícióját igen. A madár/emelőgép példát és az embeddingkvíz kontextusát ennek megfelelően javítottuk. / Earlier positions cannot read future text; current positions are visible. |
| QK és OV | Egységes sorvektoros jelölés, fejhez tartozó d_h × d kimeneti blokk. A teljes attention nem két független lineáris kör. Az általános QK-báziscsere szimmetriáját RoPE/QK-norm nélküli esetre korlátoztuk. / Correct row-vector dimensions and head-specific output slice; restricted invariance claims. |
| MLP | A megadott W_in alak mellett az oszlopok a neuronok bemeneti súlyvektorai. Az algebrai kulcs–érték felírás nem garantál neurononként egy emberi fogalmat. / Columns, not rows, select neuron inputs in this convention. |
| Normalizálás | Epsilon és tanult skála; pre-norm nem garantál warmup nélküli stabilitást. / Explicit epsilon and gain; no universal warmup-free stability guarantee. |
| Pozíció | Maszk és pozíciójel nélkül az attention permutáció-ekvivariáns; a súlymátrix sorai és oszlopai is átrendeződnek. / Permutation equivariance, not an unchanged weight matrix. |
| Logit | A skalárszorzat a vektorhosszaktól is függ, nem pusztán az iránytól. / Dot products depend on magnitudes as well as directions. |
| Attention-költség | O(T²d) számítás és naivan O(HT²) tárolt attention-elemszám különválasztva. FlashAttention nem tárolja a teljes súlymátrixot. / Arithmetic and memory costs distinguished. |
| Gradiens | Több residual rétegen át továbbra is (I + J) tényezők szorzata szerepel. A logit szerinti derivált nem azonos a paraméterfrissítés utáni tényleges logitváltozással. / Residual Jacobians still multiply; logit gradients are not guaranteed logit updates. |
| Keresztentrópia | H(P,Q) ≥ H(P) az eloszláson vett várható értékre igaz, nem minden véges tanítóminta loss-ára. ln esetén nat, log₂ esetén bit. / Expected-distribution bound, not a finite-sample loss floor. |
| bfloat16 | 1 előjelbit, 8 kitevőbit, 7 tárolt törtrészbit; FP32-nél 1/8/23. / Correct bit allocation rather than “half the mantissa”. |
| Adam és Muon | Az Adam lépései nem szükségképpen egységnyiek. Két FP32 momentumállapot BF16 súlyok mellett négyszeres bájtmennyiség. Muon momentumfrissítést ortogonalizál; nem explicit Hess-mátrixot számol. / Correct update and storage interpretations. |
| Chinchilla | Az α = 0,34 és β = 0,28 illesztésből a kitevők β/(α+β) ≈ 0,45 és α/(α+β) ≈ 0,55. A ~20 token/paraméter ökölszabály, nem univerzális konstans vagy fele-fele költségfelosztás. / Fit-dependent exponents and qualified heuristic. |
| Skálázási ábra | Képletből számolt játékmodell váltotta fel a hibásan rajzolt burkolót. A folytonos optimum egyik kiválasztott görbénél sem magasabb; a tengely L−E-t jelöl. / Computed toy curves with a valid continuous optimum and excess-loss axis. |
| Spekulatív mintavétel | Elfogadás min(1,p/q), elutasításkor normalizált max(0,p−q). Nem egyszerű p-ből újramintázás, és nem garantált gyorsulás. / Correct rejection correction and qualified speedup. |
| KV-cache | Az új pozíció Q, K és V számítása is szükséges; csak a régi K/V számítás marad el. / New Q/K/V still computed. |
| Kalibráció | Tokenvalószínűség ≠ állításhelyesség valószínűsége. Az utótanítás és a kalibráció kapcsolata feladat- és módszerfüggő. / Separated token likelihood from calibrated correctness. |
| Tokenizáció | A speciális token kezelése API-/formátumfüggő. A ritka token nem bizonyíthatóan változatlan inicializálási zaj. A BPE-merge számpéldában a speciális tokeneket kifejezetten kizártuk. / Explicit API and toy-vocabulary assumptions. |
| Kutatási állítások | A reversal curse, induction head, SAE és alignment faking eredményeit a vizsgált konstrukciókra vagy kísérletekre korlátoztuk. A hallucináció lehetetlenségi „bizonyítását” eltávolítottuk. / Limited claims to the studied settings; removed an unsupported impossibility claim. |

28 kvízkérdés szövege, helyes válasza vagy magyarázata változott. A kérdésazonosítók és a numerikus megoldókulcsok megmaradtak; a böngészőben tárolt haladást nem töröljük.

28 quiz items received wording, answer or explanation changes. IDs and numerical answer keys remain stable; saved progress is preserved.

## Eredeti források / Primary sources

1. [Vaswani et al. — Attention Is All You Need (2017)](https://arxiv.org/abs/1706.03762): attention, kauzális maszk, vetítések / attention, causal mask, projections.
2. [Xiong et al. — On Layer Normalization in the Transformer Architecture (2020)](https://arxiv.org/abs/2002.04745): pre-norm és warmup, a tanulmány feltételei mellett / pre-norm and warmup under the paper’s conditions.
3. [Dao et al. — FlashAttention (2022)](https://arxiv.org/abs/2205.14135): számítás és memóriaforgalom / arithmetic and memory traffic.
4. [Hoffmann et al. — Training Compute-Optimal Large Language Models (2022), D függelék / Appendix D](https://arxiv.org/html/2203.15556v1): illesztett kitevők, különböző becslési eljárások / fitted exponents and multiple estimators.
5. [Leviathan et al. — Fast Inference from Transformers via Speculative Decoding (2023), 2.3 és A.1](https://arxiv.org/html/2211.17192v2): egzakt elfogadás és korrigált eloszlás / exact acceptance and correction.
6. [Kalamkar et al. — A Study of BFLOAT16 for Deep Learning Training (2019)](https://arxiv.org/abs/1905.12322) és [Google TPU formátumleírás / format documentation](https://docs.cloud.google.com/tpu/docs/bfloat16): tartomány és pontosság / range and precision.
7. [Keller Jordan — Muon (2024)](https://kellerjordan.github.io/posts/muon/): momentum ortogonalizálása / momentum orthogonalization.
8. [Rafailov et al. — Direct Preference Optimization (2023)](https://arxiv.org/abs/2305.18290): referenciaarányos célfüggvény / reference-relative objective.
9. [Kadavath et al. — Language Models (Mostly) Know What They Know (2022)](https://arxiv.org/abs/2207.05221): feladatfüggő önértékelés / task-dependent self-evaluation.
10. [Olsson et al. — In-context Learning and Induction Heads (2022)](https://arxiv.org/abs/2209.11895): konkrét induction-konstrukciók / studied induction constructions.
11. [Belrose et al. — Eliciting Latent Predictions from Transformers with the Tuned Lens (2023)](https://arxiv.org/abs/2303.08112): köztes reprezentációk olvasásának korlátai / limitations of reading intermediate states.
12. [Gao et al. — Scaling and evaluating sparse autoencoders (2024)](https://arxiv.org/abs/2406.04093): SAE-értékelés és rekonstrukció / SAE evaluation and reconstruction.
13. [Berglund et al. — The Reversal Curse (2023)](https://arxiv.org/abs/2309.12288): kísérleti általánosítási hiányosság / experimental generalization failure.
14. [Greenblatt et al. — Alignment Faking in Large Language Models (2024)](https://arxiv.org/abs/2412.14093): meghatározott kísérleti helyzetek / specific experimental scenarios.
15. [OpenAI tiktoken — encode, allowed_special, disallowed_special](https://github.com/openai/tiktoken/blob/main/tiktoken/core.py): a forráskód tényleges speciálistoken-kezelése / actual special-token API behavior.

A források ellenőrzésének napja 2026-09-19. A cikkek dátuma nem a tananyag frissességének határa: az alapösszefüggések ellenőrzéséhez eredeti forrásokat használtunk. Ez a javítás nem a teljes 2026-os szakirodalom új áttekintése.

Sources checked on 2026-09-19. Original research is used to verify foundational claims; this patch is not a comprehensive update of all 2026 literature.

## Ellenőrzések és korlátok / Verification and limits

- A numerikus regressziós tesztek ellenőrzik többek között a kauzális maszkolást, a softmax normalizálását, véges differenciával a gradienst, a RoPE közös eltolásra való invarianciáját, a KV-cache mértékegységeit és a DPO-játékmodell deriváltját.
- A DOM-tesztek mindkét kiadásban futtatják a 14 labort, a vezérlők szélsőértékeit, a tanulási útvonalat és a haladás tárolását.
- Külön vizsgálat ellenőrzi a 60–60 kvízkérdés azonosítóit, az egyetlen helyes választ és a numerikus kulcsok egyezését.
- Nem futott valódi LLM-tanítás, teljesítménybenchmark vagy SAE-kutatás. A laborok determinisztikus oktatási modellek; a működésük nem bizonyítja egy nagy modell konkrét belső mechanizmusát.

Numerical regressions cover causal masking, softmax normalization, finite-difference gradients, RoPE shift invariance, KV-cache units and the toy DPO derivative. DOM checks exercise both editions, lab control bounds and saved progress. Quiz checks cover IDs, unique correct choices and numerical keys. No real LLM training, performance benchmark or SAE research experiment was conducted; the labs are deterministic teaching models.
