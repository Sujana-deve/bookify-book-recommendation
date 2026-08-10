from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import F, Avg
from .models import Book
from .serializers import BookSerializer
from books.recommender import get_recommendations
from books.collaborative import get_item_based_recommendations, get_user_based_recommendations
from books.hybrid import get_hybrid_recommendations
import requests

GUTENBERG_START = "*** START OF THE PROJECT GUTENBERG EBOOK"
GUTENBERG_END = "*** END OF THE PROJECT GUTENBERG EBOOK"


class BookReaderView(APIView):
    def get(self, request, pk):
        book = Book.objects.filter(pk=pk).first()
        if not book or not book.gutenberg_id:
            return Response({"error": "No readable text for this book."}, status=status.HTTP_404_NOT_FOUND)

        url = f"https://www.gutenberg.org/cache/epub/{book.gutenberg_id}/pg{book.gutenberg_id}.txt"
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return Response({"error": "Could not fetch book text."}, status=status.HTTP_502_BAD_GATEWAY)

        text = resp.text
        start = text.find(GUTENBERG_START)
        end = text.find(GUTENBERG_END)
        if start != -1:
            start = text.find("\n", start) + 1
            text = text[start:end if end != -1 else None]

        return Response({"title": book.title, "thumbnail": book.thumbnail, "text": text.strip()})


@api_view(['GET'])
def health_check(request):
    return Response({"status": "Django is connected"})


class BookListView(generics.ListAPIView):
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)

        if self.request.query_params.get('sort') == 'top_rated':
            m = 20
            c = Book.objects.exclude(average_rating__isnull=True).aggregate(
                avg=Avg('average_rating'))['avg'] or 3.5
            queryset = queryset.filter(
                average_rating__isnull=False, ratings_count__isnull=False
            ).annotate(
                wr=(F('ratings_count') / (F('ratings_count') + m)) * F('average_rating')
                   + (m / (F('ratings_count') + m)) * c
            ).order_by('-wr')

        return queryset


class BookDetailView(generics.RetrieveAPIView):
    serializer_class = BookSerializer
    queryset = Book.objects.all()


def _serialize_ordered(rec_ids):
    """Shared helper: fetch books by id, preserve similarity order, serialize."""
    if not rec_ids:
        return []
    books = Book.objects.filter(id__in=rec_ids)
    books_dict = {b.id: b for b in books}
    ordered = [books_dict[i] for i in rec_ids if i in books_dict]
    return BookSerializer(ordered, many=True).data


@api_view(['GET'])
def recommendations(request, book_id):
    """Content-based (TF-IDF) recommendations."""
    rec_ids = get_recommendations(book_id, n=10)
    return Response(_serialize_ordered(rec_ids))


@api_view(['GET'])
def item_based_recommendations(request, book_id):
    """
    'Books saved by the same people who saved this book.'
    Returns [] if this book has zero saves — no CF signal yet.
    """
    rec_ids = get_item_based_recommendations(book_id, n=10)
    return Response(_serialize_ordered(rec_ids))


@api_view(['GET'])
def user_based_recommendations(request, user_id):
    """
    'What similar-taste users saved, that this user hasn't saved yet.'
    Returns [] if user has zero saves — no CF signal yet.
    """
    rec_ids = get_user_based_recommendations(user_id, n=10)
    return Response(_serialize_ordered(rec_ids))


@api_view(['GET'])
def hybrid_recommendations(request, book_id):
    """
    Blended content + CF recommendations.
    ?alpha=0.5 optional query param (0 = pure content, 1 = pure CF, default 0.5).
    Falls back to pure content-based automatically if the book has no CF signal.
    """
    alpha = float(request.query_params.get('alpha', 0.5))
    rec_ids = get_hybrid_recommendations(book_id, n=10, alpha=alpha)
    return Response(_serialize_ordered(rec_ids))