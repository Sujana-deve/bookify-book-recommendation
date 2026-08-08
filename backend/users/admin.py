from django.contrib import admin
from .models import UserProfile, ReadingList

admin.site.register(UserProfile)

@admin.register(ReadingList)
class ReadingListAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'rating', 'saved_at')
    list_filter = ('rating',)
    search_fields = ('user__username', 'book__title')