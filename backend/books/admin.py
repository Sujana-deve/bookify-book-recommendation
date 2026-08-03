from django.contrib import admin

# Register your models here.
# backend/books/admin.py
from django.contrib import admin
from .models import Book
admin.site.register(Book)