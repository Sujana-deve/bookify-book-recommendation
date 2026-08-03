"""
Hybrid recommender — blends content-based (TF-IDF) and item-based CF scores.
Place at: backend/books/hybrid.py

final_score = alpha * cf_score_normalized + (1 - alpha) * content_score_normalized

Cold-start handling: if a book has zero CF signal (no saves yet), falls back
to pure content-based scores — same principle as the item/user CF functions.
"""
import numpy as np
from books.recommender import get_content_scores
from books.collaborative import get_item_cf_scores


def _normalize(scores):
    """Min-max scale to [0,1] so content and CF scores are comparable before blending."""
    if scores is None:
        return None
    max_val = scores.max()
    if max_val <= 0:
        return scores  # all zeros, nothing to scale
    return scores / max_val


def get_hybrid_recommendations(book_id, n=10, alpha=0.5):
    """
    alpha: weight given to CF (0 = pure content-based, 1 = pure CF, 0.5 = equal blend).
    Falls back to pure content-based automatically if this book has no CF signal.
    """
    content_ids, content_scores = get_content_scores(book_id)
    if content_scores is None:
        return []  # book doesn't exist at all

    content_scores = _normalize(content_scores)
    content_by_id = dict(zip(content_ids, content_scores))

    cf_ids, cf_scores = get_item_cf_scores(book_id)

    if cf_scores is None:
        # No CF signal for this book yet (zero saves) — pure content-based fallback
        final_by_id = content_by_id
    else:
        cf_scores = _normalize(cf_scores)
        cf_by_id = dict(zip(cf_ids, cf_scores))

        final_by_id = {}
        for bid, c_score in content_by_id.items():
            cf_score = cf_by_id.get(bid, 0)  # 0 if this book isn't in the CF matrix at all
            final_by_id[bid] = alpha * cf_score + (1 - alpha) * c_score

    ranked = sorted(final_by_id.items(), key=lambda x: x[1], reverse=True)
    return [bid for bid, score in ranked if score > 0][:n]