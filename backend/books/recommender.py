import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_cosine_sim = None
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
    Load all books from DB, build TF-IDF matrix, compute cosine similarity.
    Called once on Django startup. Stored in module-level globals.
    """
    global _cosine_sim, _book_ids, _id_to_index

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
    tfidf_matrix = vectorizer.fit_transform(corpus)
    print(f"[Recommender] TF-IDF matrix shape: {tfidf_matrix.shape}")

    print("[Recommender] Computing cosine similarity...")
    _cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix, dense_output=False)
    print("[Recommender] Engine ready.")


def get_recommendations(book_id, n=10):
    """
    Return list of up to n book IDs most similar to book_id.
    Excludes the book itself.
    """
    if _cosine_sim is None:
        return []

    idx = _id_to_index.get(book_id)
    if idx is None:
        return []

    sim_row = _cosine_sim[idx].toarray().flatten()
    sim_row[idx] = 0  # exclude self

    top_indices = np.argsort(sim_row)[::-1][:n]
    return [_book_ids[i] for i in top_indices if sim_row[i] > 0]