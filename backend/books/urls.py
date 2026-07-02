from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookListView.as_view(), name='book-list'),
    path('<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),
    path('health/', views.health_check, name='health-check'),
    path('<int:book_id>/recommendations/', views.recommendations, name='recommendations'),
]