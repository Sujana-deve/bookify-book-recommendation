from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/',           views.register,              name='register'),
    path('login/',              TokenObtainPairView.as_view(), name='login'),
    path('refresh/',            TokenRefreshView.as_view(),    name='token_refresh'),
    path('logout/',             views.logout,                name='logout'),
    path('me/',                 views.me,                    name='me'),
    path('reading-list/',       views.reading_list,          name='reading-list'),
    path('reading-list/ids/',   views.saved_book_ids,        name='saved-book-ids'),
    path('save/<int:book_id>/', views.save_book,             name='save-book'),
    path('unsave/<int:book_id>/', views.unsave_book,         name='unsave-book'),
]