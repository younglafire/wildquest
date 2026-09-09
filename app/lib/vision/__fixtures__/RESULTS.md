# Pinned ResNet-50 fixture results

Recorded with `@huggingface/transformers` 3.8.1 and the bundled q8 ONNX model.
Confidence is the probability of the highest raw ImageNet class. The battle
slice intentionally accepts only six exact classes and does not aggregate broad
dog, cat, or butterfly families.

| Fixture       | WildQuest species | Winning ImageNet label                                           | Confidence |
| ------------- | ----------------- | ---------------------------------------------------------------- | ---------- |
| dog.jpg       | golden_retriever  | golden retriever                                                 | 0.984612   |
| butterfly.jpg | monarch_butterfly | monarch, monarch butterfly, milkweed butterfly, Danaus plexippus | 0.998493   |

The other six legacy broad-animal fixtures remain useful negative examples:
their winning classes are not in the six-creature roster and are rejected.

Run the real-model suite again with:

```bash
RUN_RESNET_INTEGRATION=1 npx vitest run app/lib/vision/classifier.integration.test.ts
```
