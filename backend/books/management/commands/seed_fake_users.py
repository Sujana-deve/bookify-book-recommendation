"""
Management command: seed fake users + reading-list saves for CF testing.
Put this file at: backend/books/management/commands/seed_fake_users.py
(create the management/commands folders + empty __init__.py files if missing)

Run with: python manage.py seed_fake_users
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from books.models import Book
from users.models import ReadingList

GENRES = ['Fiction', 'Biography', 'History', 'Science', 'Philosophy',
          'Psychology', 'Romance', 'Fantasy', 'Mystery', 'Self-Help', 'Children']

NUM_FAKE_USERS = 40
MIN_SAVES, MAX_SAVES = 15, 25
GENRE_WEIGHT = 0.75  # 75% of saves come from favorite genre, 25% random (mimics real browsing)


class Command(BaseCommand):
    help = 'Seed fake users with genre-clustered reading-list saves, for CF training/testing.'

    def handle(self, *args, **options):
        # Pre-fetch book ids grouped by genre, once, to avoid N+1 queries per user
        books_by_genre = {}
        for genre in GENRES:
            ids = list(Book.objects.filter(categories__icontains=genre).values_list('id', flat=True)[:500])
            books_by_genre[genre] = ids

        all_ids = list(Book.objects.values_list('id', flat=True))
        if not all_ids:
            self.stdout.write(self.style.ERROR('No books in DB — load books first.'))
            return

        created_users = 0
        created_saves = 0

        for i in range(1, NUM_FAKE_USERS + 1):
            username = f'fakeuser_{i}'
            user, was_created = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@test.local'},
            )
            if was_created:
                user.set_unusable_password()
                user.save()
                created_users += 1

            fav_genre = random.choice(GENRES)
            genre_pool = books_by_genre.get(fav_genre) or all_ids
            n_saves = random.randint(MIN_SAVES, MAX_SAVES)
            n_genre = int(n_saves * GENRE_WEIGHT)
            n_random = n_saves - n_genre

            picks = set()
            if genre_pool:
                picks.update(random.sample(genre_pool, min(n_genre, len(genre_pool))))
            picks.update(random.sample(all_ids, min(n_random, len(all_ids))))

            for book_id in picks:
                _, made = ReadingList.objects.get_or_create(user=user, book_id=book_id)
                if made:
                    created_saves += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. {created_users} fake users created, {created_saves} reading-list saves added.'
        ))