from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer, ReadingListSerializer
from .models import ReadingList
from books.models import Book


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reading_list(request):
    """Return all books saved by the current user."""
    items = ReadingList.objects.filter(user=request.user).select_related('book')
    serializer = ReadingListSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_book(request, book_id):
    """Save a book to the user's reading list."""
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)

    item, created = ReadingList.objects.get_or_create(user=request.user, book=book)
    if not created:
        return Response({'error': 'Already saved.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Book saved.', 'id': item.id}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_book(request, book_id):
    """Remove a book from the user's reading list."""
    deleted, _ = ReadingList.objects.filter(user=request.user, book_id=book_id).delete()
    if deleted:
        return Response({'message': 'Removed from reading list.'}, status=status.HTTP_200_OK)
    return Response({'error': 'Not in reading list.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_book_ids(request):
    """Return just the book IDs saved by the user — used by frontend to show bookmark state."""
    ids = ReadingList.objects.filter(user=request.user).values_list('book_id', flat=True)
    return Response(list(ids))