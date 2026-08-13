from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookListView.as_view(), name='book-list'),
    path('<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),
    path('health/', views.health_check, name='health-check'),
    path('<int:book_id>/recommendations/', views.recommendations, name='recommendations'),
    path('<int:book_id>/recommendations/cf/', views.item_based_recommendations, name='cf-item-recommendations'),
    path('<int:book_id>/recommendations/hybrid/', views.hybrid_recommendations, name='hybrid-recommendations'),
    path('users/<int:user_id>/recommendations/', views.user_based_recommendations, name='cf-user-recommendations'),
    path('<int:pk>/read/', views.BookReaderView.as_view()),
    path('<int:book_id>/reviews/', views.book_reviews, name='book-reviews'),
]