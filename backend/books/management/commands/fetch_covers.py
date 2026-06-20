import time
import requests
from django.core.management.base import BaseCommand
from books.models import Book

COVER_URL = "https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false"

def fetch_cover_url(isbn):
    if not isbn:
        return None
    try:
        url = COVER_URL.format(isbn=isbn)
        response = requests.get(url, timeout=8, allow_redirects=True)
        if response.status_code == 200 and 'image' in response.headers.get('Content-Type', ''):
            return url.replace("?default=false", "")
        return None
    except requests.RequestException:
        return None

class Command(BaseCommand):
    help = "Fetch missing book cover thumbnails from Open Library by ISBN"

    def add_arguments(self, parser):
        parser.add_argument('--delay', type=float, default=0.5)
        parser.add_argument('--limit', type=int, default=None)

    def handle(self, *args, **options):
        delay = options['delay']
        limit = options['limit']

        qs = Book.objects.filter(thumbnail__isnull=True) | Book.objects.filter(thumbnail='')
        qs = qs.order_by('id')
        if limit:
            qs = qs[:limit]

        total = qs.count()
        self.stdout.write(f"Found {total} books with no thumbnail. Starting fetch...\n")

        found = skipped = failed = 0

        for i, book in enumerate(qs, start=1):
            self.stdout.write(f"[{i}/{total}] {book.title[:50]!r} ... ", ending='')

            cover_url = fetch_cover_url(book.isbn13) or fetch_cover_url(book.isbn10)

            if cover_url:
                book.thumbnail = cover_url
                book.save(update_fields=['thumbnail'])
                self.stdout.write(self.style.SUCCESS("found"))
                found += 1
            elif not book.isbn13 and not book.isbn10:
                self.stdout.write(self.style.WARNING("no ISBN, skipped"))
                skipped += 1
            else:
                self.stdout.write(self.style.ERROR("not found"))
                failed += 1

            time.sleep(delay)

        self.stdout.write(f"\nUpdated: {found} | Skipped: {skipped} | Missing: {failed}")