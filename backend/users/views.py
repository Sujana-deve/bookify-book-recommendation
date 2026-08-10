from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from textblob import TextBlob

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_book(request, book_id):
    """
    Set/update rating (1-5) and/or review text on a book already in the reading list.
    Sending 'review' also computes sentiment automatically via TextBlob.
    Backward compatible — sending only 'rating' works exactly as before.
    """
    rating = request.data.get('rating')
    review_text = (request.data.get('review') or '').strip()

    update_fields = {}

    if rating is not None:
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({'error': 'rating must be an integer 1-5.'}, status=status.HTTP_400_BAD_REQUEST)
        if not 1 <= rating <= 5:
            return Response({'error': 'rating must be 1-5.'}, status=status.HTTP_400_BAD_REQUEST)
        update_fields['rating'] = rating

    if review_text:
        polarity = TextBlob(review_text).sentiment.polarity
        if polarity > 0.2:
            sentiment = 'positive'
        elif polarity < -0.2:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        update_fields['review_text'] = review_text
        update_fields['sentiment'] = sentiment

    if not update_fields:
        return Response({'error': 'Provide rating and/or review.'}, status=status.HTTP_400_BAD_REQUEST)

    updated = ReadingList.objects.filter(user=request.user, book_id=book_id).update(**update_fields)
    if not updated:
        return Response({'error': 'Save the book before rating/reviewing it.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Saved.', **update_fields})