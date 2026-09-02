# Pinned ResNet-50 fixture results

Recorded with `@huggingface/transformers` 3.8.1 and the bundled q8 ONNX model.
Confidence is the aggregate probability for all mapped classes of the winning
WildQuest species.

| Fixture       | WildQuest species | Winning ImageNet label                                                                       | Confidence |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------- | ---------- |
| dog.jpg       | dog               | golden retriever                                                                             | 0.984612   |
| cat.jpg       | cat               | tiger cat                                                                                    | 0.949448   |
| bee.jpg       | bee               | bee                                                                                          | 0.850027   |
| chicken.jpg   | chicken           | hen                                                                                          | 0.995196   |
| butterfly.jpg | butterfly         | monarch, monarch butterfly, milkweed butterfly, Danaus plexippus                             | 0.998493   |
| dragonfly.jpg | dragonfly         | dragonfly, darning needle, devil's darning needle, sewing needle, snake feeder, snake doctor | 0.972706   |
| frog.jpg      | frog              | tree frog, tree-frog                                                                         | 0.993532   |
| ant.jpg       | ant               | ant, emmet, pismire                                                                          | 0.995575   |

Run the real-model suite again with:

```bash
RUN_RESNET_INTEGRATION=1 npx vitest run app/lib/vision/classifier.integration.test.ts
```
