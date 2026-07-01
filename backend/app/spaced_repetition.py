import math
from datetime import datetime, timedelta

DECAY_TAU_DAYS = 7.0
MIN_EASE_FACTOR = 1.3
DEFAULT_EASE_FACTOR = 2.5


def similarity_to_quality(similarity_score: float) -> int:
    similarity_score = max(0.0, min(1.0, similarity_score))
    return int(round(similarity_score * 5))


def decay_mastery(mastery: float, last_reviewed_at: datetime,
                   now: datetime = None, tau_days: float = DECAY_TAU_DAYS) -> float:
    if last_reviewed_at is None:
        return mastery

    now = now or datetime.utcnow()
    elapsed_days = max(0.0, (now - last_reviewed_at).total_seconds() / 86400.0)

    decay_factor = math.exp(-elapsed_days / tau_days)
    floor = 0.05
    decayed = floor + (mastery - floor) * decay_factor
    return max(0.0, min(1.0, decayed))


def sm2_update(quality: int, repetitions: int, interval_days: int, ease_factor: float):
    if quality < 0 or quality > 5:
        raise ValueError("quality must be in range 0-5")

    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval_days * ease_factor)
        new_repetitions = repetitions + 1
    else:
        new_repetitions = 0
        new_interval = 1

    new_ease = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease = max(MIN_EASE_FACTOR, new_ease)

    return new_repetitions, new_interval, new_ease


def get_or_create_schedule(db, user_id: int, topic_id: int):
    row = db.execute(
        """
        SELECT id, ease_factor, interval_days, repetitions,
               last_reviewed_at, next_review_at, decayed_mastery
        FROM review_schedule
        WHERE user_id = %s AND topic_id = %s
        """,
        (user_id, topic_id),
    ).fetchone()

    if row is not None:
        return row

    db.execute(
        """
        INSERT INTO review_schedule
            (user_id, topic_id, ease_factor, interval_days, repetitions, next_review_at)
        VALUES (%s, %s, %s, 1, 0, NOW())
        ON CONFLICT (user_id, topic_id) DO NOTHING
        """,
        (user_id, topic_id, DEFAULT_EASE_FACTOR),
    )
    db.commit()

    return db.execute(
        """
        SELECT id, ease_factor, interval_days, repetitions,
               last_reviewed_at, next_review_at, decayed_mastery
        FROM review_schedule
        WHERE user_id = %s AND topic_id = %s
        """,
        (user_id, topic_id),
    ).fetchone()


def get_due_topics(db, user_id: int, limit: int = 10):
    return db.execute(
        """
        SELECT rs.topic_id, t.name AS topic_name, rs.next_review_at,
               rs.decayed_mastery, rs.repetitions
        FROM review_schedule rs
        JOIN topics t ON t.id = rs.topic_id
        WHERE rs.user_id = %s AND rs.next_review_at <= NOW()
        ORDER BY rs.next_review_at ASC
        LIMIT %s
        """,
        (user_id, limit),
    ).fetchall()


def record_review(db, bkt_get_mastery_fn, user_id: int, topic_id: int,
                   similarity_score: float, now: datetime = None):
    now = now or datetime.utcnow()
    quality = similarity_to_quality(similarity_score)

    schedule = get_or_create_schedule(db, user_id, topic_id)

    new_reps, new_interval, new_ease = sm2_update(
        quality=quality,
        repetitions=schedule["repetitions"],
        interval_days=schedule["interval_days"],
        ease_factor=float(schedule["ease_factor"]),
    )

    next_review_at = now + timedelta(days=new_interval)
    current_mastery = bkt_get_mastery_fn(user_id, topic_id)

    db.execute(
        """
        UPDATE review_schedule
        SET repetitions = %s, interval_days = %s, ease_factor = %s,
            last_reviewed_at = %s, next_review_at = %s, decayed_mastery = %s
        WHERE user_id = %s AND topic_id = %s
        """,
        (new_reps, new_interval, new_ease, now, next_review_at,
         current_mastery, user_id, topic_id),
    )
    db.commit()

    return {
        "topic_id": topic_id,
        "quality": quality,
        "repetitions": new_reps,
        "interval_days": new_interval,
        "ease_factor": round(new_ease, 2),
        "next_review_at": next_review_at.isoformat(),
    }


def get_dashboard_mastery(db, bkt_get_mastery_fn, user_id: int, topic_id: int,
                           now: datetime = None) -> float:
    now = now or datetime.utcnow()
    row = db.execute(
        "SELECT last_reviewed_at, decayed_mastery FROM review_schedule "
        "WHERE user_id = %s AND topic_id = %s",
        (user_id, topic_id),
    ).fetchone()

    raw_mastery = bkt_get_mastery_fn(user_id, topic_id)

    if row is None or row["last_reviewed_at"] is None:
        return raw_mastery

    return decay_mastery(raw_mastery, row["last_reviewed_at"], now=now)