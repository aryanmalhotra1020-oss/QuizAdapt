import random


def classify_topics(topics, performances, bkt):
    """Splits topics into weak/moderate/strong lists based on current BKT scores."""
    weak, moderate, strong = [], [], []
    for topic in topics:
        score = performances.get(topic.id, bkt.p_know)
        classification = bkt.classify(score)
        if classification == 'weak':
            weak.append(topic)
        elif classification == 'moderate':
            moderate.append(topic)
        else:
            strong.append(topic)
    return weak, moderate, strong


def select_adaptive_topics(topics, performances, bkt, n_weak=5, n_moderate=3, n_strong=2):
    """
    Selects topics for a quiz using the 50/30/20 weak/moderate/strong weighting.
    This is the single source of truth for adaptive topic selection - both the
    real quiz generation route and the BKT validation script call this, so the
    validation script is testing actual production behavior, not a re-implementation.
    """
    weak, moderate, strong = classify_topics(topics, performances, bkt)

    selected = []
    selected += random.sample(weak, min(n_weak, len(weak)))
    selected += random.sample(moderate, min(n_moderate, len(moderate)))
    selected += random.sample(strong, min(n_strong, len(strong)))

    if len(selected) < 5:
        remaining = [t for t in topics if t not in selected]
        selected += random.sample(remaining, min(5 - len(selected), len(remaining)))

    return selected, weak, moderate, strong