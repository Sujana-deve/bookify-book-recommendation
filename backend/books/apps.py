import sys

from django.apps import AppConfig


class BooksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'books'

    def ready(self):
        if 'runserver' not in sys.argv:
            return
        from books.recommender import build_engine
        from books.collaborative import build_cf_engine
        build_engine()
        build_cf_engine()