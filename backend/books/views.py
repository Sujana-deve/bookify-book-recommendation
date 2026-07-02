from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

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