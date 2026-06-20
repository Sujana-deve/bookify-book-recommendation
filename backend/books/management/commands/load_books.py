import csv
import ast
import re
from django.core.management.base import BaseCommand
from books.models import Book


def parse_year(date_str):
    if not date_str or date_str.strip() == '':
        return None
    date_str = date_str.strip()
    match = re.search(r'\b(19|20)\d{2}\b', date_str)
    if match:
        return int(match.group())
    match = re.match(r'\d{1,2}/\d{1,2}/(\d{2})$', date_str)
    if match:
        yy = int(match.group(1))
        return 2000 + yy if yy <= 30 else 1900 + yy
    return None


def parse_list_field(value):
    if not value or value.strip() == '':
        return ''
    try:
        parsed = ast.literal_eval(value)
        if isinstance(parsed, list):
            return ', '.join(str(x) for x in parsed[:3])
    except (ValueError, SyntaxError):
        pass
    return value.strip()


def parse_float(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def parse_int(value):
    try:
        return int(str(value).replace(',', '').strip())
    except (ValueError, TypeError):
        return 0


class Command(BaseCommand):
    help = 'Load books from Best Books Ever CSV into the database'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing books before loading')
        parser.add_argument('--limit', type=int, default=None, help='Max number of books to load')

    def handle(self, *args, **options):
        if options['clear']:
            count = Book.objects.count()
            Book.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Cleared {count} existing books.'))

        filepath = 'data/books_1.Best_Books_Ever.csv'
        limit = options['limit']
        created = 0
        skipped = 0
        errors = 0

        self.stdout.write(f'Loading from {filepath}...\n')

        with open(filepath, encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if limit and created >= limit:
                    break
                try:
                    title = row.get('title', '').strip()
                    if not title:
                        skipped += 1
                        continue

                    isbn_raw = row.get('isbn', '').strip().replace('-', '')
                    isbn13 = isbn_raw if len(isbn_raw) == 13 else None
                    isbn10 = isbn_raw if len(isbn_raw) == 10 else None

                    # Skip if isbn13 already exists in DB
                    if isbn13 and Book.objects.filter(isbn13=isbn13).exists():
                        skipped += 1
                        continue

                    Book.objects.create(
                        isbn13=isbn13,
                        isbn10=isbn10,
                        title=title,
                        subtitle=None,
                        authors=row.get('author', '').strip() or None,
                        categories=parse_list_field(row.get('genres', '')) or None,
                        thumbnail=row.get('coverImg', '').strip() or None,
                        description=row.get('description', '').strip() or None,
                        published_year=parse_year(row.get('publishDate', '')),
                        average_rating=parse_float(row.get('rating', 0)),
                        num_pages=parse_int(row.get('pages', 0)),
                        ratings_count=parse_int(row.get('numRatings', 0)),
                    )
                    created += 1

                    if created % 1000 == 0:
                        self.stdout.write(f'  {created} books loaded...')

                except Exception as e:
                    errors += 1
                    if errors <= 5:
                        self.stdout.write(self.style.ERROR(f'  Row {i+1} error: {e}'))

        self.stdout.write('\n--- Done ---')
        self.stdout.write(self.style.SUCCESS(f'  Created : {created}'))
        self.stdout.write(self.style.WARNING(f'  Skipped : {skipped}'))
        self.stdout.write(self.style.ERROR(  f'  Errors  : {errors}'))