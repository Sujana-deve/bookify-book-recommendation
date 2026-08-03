"""
Collaborative filtering engine — item-based and user-based.
Place at: backend/books/collaborative.py

Built on ReadingList saves (binary implicit feedback), same architectural
pattern as recommender.py: build matrix once at startup, compute similarity
per-request against a single row (not full pairwise), to avoid O(n^2) memory.
"""
import numpy as np
from scipy.sparse import csr_matrix

_user_item_matrix = None   # rows=users, cols=books (for user-based CF)
_item_user_matrix = None   # rows=books, cols=users (for item-based CF) — just the transpose
_user_ids = []
_book_ids = []
_user_id_to_index = {}
_book_id_to_index = {}


def build_cf_engine():
    """
    Load all ReadingList saves, build a sparse user-item matrix.
    Called once on Django startup, same as build_engine() in recommender.py.
    """
    global _user_item_matrix, _item_user_matrix, _user_ids, _book_ids
    global _user_id_to_index, _book_id_to_index

    from users.models import ReadingList

    print("[CF] Loading reading-list saves...")
    saves = list(ReadingList.objects.values_list('user_id', 'book_id'))
    print(f"[CF] {len(saves)} saves loaded.")

    if not saves:
        print("[CF] No saves found — CF engine disabled, will fall back to content-based only.")
        return

    unique_user_ids = sorted({u for u, b in saves})
    unique_book_ids = sorted({b for u, b in saves})

    _user_ids = unique_user_ids
    _book_ids = unique_book_ids
    _user_id_to_index = {uid: i for i, uid in enumerate(unique_user_ids)}
    _book_id_to_index = {bid: i for i, bid in enumerate(unique_book_ids)}

    rows = [_user_id_to_index[u] for u, b in saves]
    cols = [_book_id_to_index[b] for u, b in saves]
    data = [1] * len(saves)

    _user_item_matrix = csr_matrix(
        (data, (rows, cols)),
        shape=(len(unique_user_ids), len(unique_book_ids))
    )
    _item_user_matrix = _user_item_matrix.T.tocsr()

    print(f"[CF] User-item matrix shape: {_user_item_matrix.shape}")
    print("[CF] Engine ready.")


def get_item_based_recommendations(book_id, n=10):
    """
    'Books saved by the same people who saved this book.'
    Same one-row-at-a-time pattern as TF-IDF recommender — no full pairwise matrix.
    """
    if _item_user_matrix is None:
        return []

    idx = _book_id_to_index.get(book_id)
    if idx is None:
        return []  # book has zero saves — no CF signal, caller should fall back to content-based

    book_vector = _item_user_matrix[idx]
    sim_scores = (_item_user_matrix @ book_vector.T).toarray().flatten()
    sim_scores[idx] = 0

    top_indices = np.argsort(sim_scores)[::-1][:n]
    return [_book_ids[i] for i in top_indices if sim_scores[i] > 0]


def get_user_based_recommendations(user_id, n=10):
    """
    'What similar-taste users saved, that this user hasn't saved yet.'
    """
    if _user_item_matrix is None:
        return []

    idx = _user_id_to_index.get(user_id)
    if idx is None:
        return []  # new user, no saves yet — no CF signal, caller should fall back to content-based

    user_vector = _user_item_matrix[idx]
    sim_scores = (_user_item_matrix @ user_vector.T).toarray().flatten()
    sim_scores[idx] = 0

    top_user_indices = np.argsort(sim_scores)[::-1][:10]  # look at top 10 similar users
    already_saved = set(_user_item_matrix[idx].indices)

    # aggregate what similar users saved, weighted by how similar they are
    book_scores = np.zeros(_user_item_matrix.shape[1])
    for u_idx in top_user_indices:
        if sim_scores[u_idx] <= 0:
            continue
        book_scores += sim_scores[u_idx] * _user_item_matrix[u_idx].toarray().flatten()

    top_book_indices = np.argsort(book_scores)[::-1]
    results = []
    for i in top_book_indices:
        if book_scores[i] <= 0:
            break
        if i in already_saved:
            continue
        results.append(_book_ids[i])
        if len(results) >= n:
            break
    return results

"""
ADD THIS FUNCTION to your existing books/collaborative.py (append at the bottom).
Don't replace the file — just add this one function alongside the others.
"""

def get_item_cf_scores(book_id):
    """
    Returns (book_ids_list, raw_similarity_scores_array) for books that have
    a CF signal, unfiltered — used by hybrid.py to blend with content scores.
    Returns ([], None) if this book has zero saves (no CF signal yet).
    """
    if _item_user_matrix is None:
        return [], None

    idx = _book_id_to_index.get(book_id)
    if idx is None:
        return [], None

    book_vector = _item_user_matrix[idx]
    sim_scores = (_item_user_matrix @ book_vector.T).toarray().flatten()
    sim_scores[idx] = 0
    return _book_ids, sim_scores