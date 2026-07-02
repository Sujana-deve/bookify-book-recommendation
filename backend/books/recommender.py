import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

_tfidf_matrix = None
_book_ids = []
_id_to_index = {}


def _build_combined_text(book):
    """Combine authors + categories (weighted x2) + description into one string."""
    authors = book.authors or ''
    categories = book.categories or ''
    description = book.description or ''
    return f"{authors} {categories} {categories} {description}"


def build_engine():
    """
    Load all books from DB, build TF-IDF matrix.
    Similarity is computed on demand per request, not precomputed.
    Called once on Django startup.
    """
    global _tfidf_matrix, _book_ids, _id_to_index

    from books.models import Book

    print("[Recommender] Loading books from database...")
    books = list(Book.objects.only('id', 'authors', 'categories', 'description'))
    print(f"[Recommender] {len(books)} books loaded.")

    _book_ids = [b.id for b in books]
    _id_to_index = {b.id: i for i, b in enumerate(books)}

    corpus = [_build_combined_text(b) for b in books]

    print("[Recommender] Building TF-IDF matrix...")
    vectorizer = TfidfVectorizer(
        max_features=10000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
    )
    _tfidf_matrix = vectorizer.fit_transform(corpus)
    print(f"[Recommender] TF-IDF matrix shape: {_tfidf_matrix.shape}")
    print("[Recommender] Engine ready.")


def get_recommendations(book_id, n=10):
    """
    Compute similarity for one book against all others on demand.
    Returns list of up to n similar book IDs.
    """
    if _tfidf_matrix is None:
        return []

    idx = _id_to_index.get(book_id)
    if idx is None:
        return []

    # Get the single row for this book and compute similarity against all
    book_vector = _tfidf_matrix[idx]
    sim_scores = (_tfidf_matrix @ book_vector.T).toarray().flatten()
    sim_scores[idx] = 0  # exclude self

    top_indices = np.argsort(sim_scores)[::-1][:n]
    return [_book_ids[i] for i in top_indices if sim_scores[i] > 0]