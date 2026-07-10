from datetime import datetime, timedelta, timezone
import math

DECAY_TAU_DAYS = 7


def score_to_quality(score):
    """Convert a 0-1 semantic similarity score into an SM-2 quality rating (0-5)."""
    quality = round(score * 5)
    return max(0, min(5, quality))


def sm2_update(easiness_factor, interval_days, repetitions, quality):
    """
    Apply the SM-2 algorithm to compute the next review interval.
    quality: 0-5 rating derived from semantic similarity score.
    Returns (new_easiness_factor, new_interval_days, new_repetitions, next_review_date)
    """
    if quality < 3:
        repetitions = 0
        interval_days = 1
    else:
        if repetitions == 0:
            interval_days = 1
        elif repetitions == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * easiness_factor)
        repetitions += 1

    easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easiness_factor = max(1.3, easiness_factor)

    next_review_date = datetime.now(timezone.utc) + timedelta(days=interval_days)

    return easiness_factor, interval_days, repetitions, next_review_date


def apply_forgetting_curve(strength_score, last_reviewed_at, baseline=0.2):
    """
    Exponentially decay a BKT mastery score based on time since last review.
    Approaches `baseline` (not zero) since some retention always persists.
    """
    if last_reviewed_at is None:
        return strength_score

    # Handle naive datetimes from rows created before the timezone-aware fix
    if last_reviewed_at.tzinfo is None:
        last_reviewed_at = last_reviewed_at.replace(tzinfo=timezone.utc)

    days_elapsed = (datetime.now(timezone.utc) - last_reviewed_at).total_seconds() / 86400
    if days_elapsed <= 0:
        return strength_score

    decay_factor = math.exp(-days_elapsed / DECAY_TAU_DAYS)
    decayed_score = baseline + (strength_score - baseline) * decay_factor
    return max(0.0, min(1.0, decayed_score))