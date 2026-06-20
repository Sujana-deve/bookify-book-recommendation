from django.db import models

class Book(models.Model):
    isbn13 = models.CharField(max_length=13, unique=True, null=True, blank=True)
    isbn10 = models.CharField(max_length=10, null=True, blank=True)  # not unique — new dataset has no isbn10
    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, null=True, blank=True)
    authors = models.CharField(max_length=500, null=True, blank=True)
    categories = models.CharField(max_length=300, null=True, blank=True)
    thumbnail = models.URLField(max_length=1000, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    published_year = models.IntegerField(null=True, blank=True)
    average_rating = models.FloatField(null=True, blank=True)
    num_pages = models.IntegerField(null=True, blank=True)
    ratings_count = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-average_rating']