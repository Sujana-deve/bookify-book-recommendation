import csv
import re
import os
from django.core.management.base import BaseCommand
from books.models import Book


def extract_gutenberg_id(link):
    match = re.search(r'/ebooks/(\d+)', str(link))
    return int(match.group(1)) if match else None


def normalize_title(title):
    return re.sub(r'[^a-z0-9\s]', '', str(title).lower()).strip()


def normalize_author(author):
    """Handle both 'First Last' and 'Last, First' formats."""
    author = str(author).lower().strip()
    if ',' in author:
        parts = author.split(',', 1)
        author = f"{parts[1].strip()} {parts[0].strip()}"
    return re.sub(r'[^a-z0-9\s]', '', author).strip()


def author_overlap(a1, a2):
    """Check if authors share at least one significant word (last name)."""
    words1 = set(a1.split()) - {'the', 'a', 'an', 'and', 'of', 'jr', 'sr'}
    words2 = set(a2.split()) - {'the', 'a', 'an', 'and', 'of', 'jr', 'sr'}
    return bool(words1 & words2)


class Command(BaseCommand):
    help = 'Match Gutenberg metadata to existing books by title + author only'

    def handle(self, *args, **kwargs):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        csv_path = os.path.join(base_dir, 'data', 'gutenberg_metadata.csv')

        if not os.path.exists(csv_path):
            self.stderr.write(f'File not found: {csv_path}')
            return

        self.stdout.write(f'Loading Gutenberg metadata from {csv_path}...')

        # Build lookup: normalized_title -> list of (gutenberg_id, normalized_author)
        gutenberg_map = {}
        with open(csv_path, encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                gid = extract_gutenberg_id(row.get('Link', ''))
                title = normalize_title(row.get('Title', ''))
                author = normalize_author(row.get('Author', ''))
                if gid and title:
                    if title not in gutenberg_map:
                        gutenberg_map[title] = []
                    gutenberg_map[title].append((gid, author))

        self.stdout.write(f'Gutenberg catalogue: {len(gutenberg_map)} unique titles.')

        matched = 0
        skipped = 0
        books = Book.objects.filter(gutenberg_id__isnull=True)
        self.stdout.write(f'Checking {books.count()} unmatched books...')

        for book in books:
            norm_title = normalize_title(book.title)
            norm_author = normalize_author(book.authors or '')

            candidates = gutenberg_map.get(norm_title, [])
            gid = None

            for candidate_gid, candidate_author in candidates:
                if author_overlap(norm_author, candidate_author):
                    gid = candidate_gid
                    break

            if gid:
                book.gutenberg_id = gid
                book.save(update_fields=['gutenberg_id'])
                matched += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. Matched: {matched} | Unmatched: {skipped}'
        ))