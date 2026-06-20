from django.db import models
from django.contrib.auth.models import User
from books.models import Book


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    favorite_genres = models.CharField(max_length=300, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} profile'


class ReadingList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_list')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')  # can't save the same book twice
        ordering = ['-saved_at']

    def __str__(self):
        return f'{self.user.username} → {self.book.title}'