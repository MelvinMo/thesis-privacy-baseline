### Trials

#### Trial 1

The set up in this trial differed slightly from the set up explained [here](../../README.md#experimental-design) (which is the final set up). I had two instructions, one emphasized accuracy and one emphasized readability and I was comparing the two. I was also using a different model - Xenova/DeBERTa-v3-base-mnli.

- **Observations**: The actual word count that the AI outputs is not consistent with the length in the prompt. The readable prompt has longer responses.

To fix this, the following was added to the prompt to force the AI to generate responses between 80 - 100% of the requested length: `must be strictly between ${0.8 * length}-${length} words)`

#### Trial 2, 3, 4

These trials all had the same conditions. Now the problem of response length from Trial 1 was fixed.

- **Observations**: NLI scores for privacy policy indicated reasonable consistency, however NLI score for PIPEDA indicated neutrality or even contradiction. From all 3 readability metrics, the "accurate" prompt generates slightly less readable responses.

#### Trial 5, 6

Switched to the model mentioned in the experimental set up: DeBERTa-v3-large-mnli-fever-anli-ling-wanli

- **Observations**: much better NLI scores overall for both privacy policy and PIPEDA. However, the NLI scores were quite similar between the "readable" and "accurate" prompts.
- I noticed that Coleman Liau is yielding significantly higher grade levels than Flesch-Kincaid. This may be because the metric normalizes per 100 words and our explanations are way shorter than that, potentially causing this metric to be less accurate. Therefore, it was decided to not use this metric for readability anymore.

#### Trial 7

I was noticing that the "readable" prompt and "accurate" prompt were not that different in terms of readability and even then the "readable" prompt still required a grade 11 reading level, which is above the American average.

So, I decided to test out how explicit of a prompt I would need to reduce the reading level. I tried the following prompt:
“Do not use complex words/jargon. Your explanations should be understandable by a 12-year-old.”

- **Observations**: The average grade level dropped down to about 8-9, and consistency remained similar as before.

#### Trial 8 and 9

I realized that there were too many variables making the analysis too complex. Since the main objective was to analyze the relationship between consistency and readability, instruction type was removed as a variable and only pne prompt was used (the main analysis prompt).

These two trials were done as a preliminary test for this new approach with only 10-15 test cases, not the full 40.

#### Trial 10

Added the response length of 40 to the test cases to bridge the gap between 30 and 50, bringing the total number of test cases to 48.

#### Trial 11 and 12

Ran under the final conditions described in the experimental setup. Modified the code so that test cases where the Gemini LLM returned an error response were not part of the raw data.

Trial 11 was used for final results. But considering that the results for trial 12 do not match trial 11, the analysis below should be taken with a grain of salt. Because of the non-deterministic nature of LLM's, there is a lot of variability in the raw data and it is hard to establish the relationships that we are looking for. Metrics that take into account specific legal and technical jargon, rules based metrics, or finetuned NLI models should be considered in the future to make this analysis more robust.
