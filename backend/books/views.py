from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
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

        return Response({"title": book.title, "text": text.strip()})

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
        return queryset

class BookDetailView(generics.RetrieveAPIView):
    serializer_class = BookSerializer
    queryset = Book.objects.all()

from books.recommender import get_recommendations

@api_view(['GET'])
def recommendations(request, book_id):
    rec_ids = get_recommendations(book_id, n=10)
    if not rec_ids:
        return Response([])
    books = Book.objects.filter(id__in=rec_ids)
    # preserve similarity order
    books_dict = {b.id: b for b in books}
    ordered = [books_dict[i] for i in rec_ids if i in books_dict]
    serializer = BookSerializer(ordered, many=True)
    return Response(serializer.data)