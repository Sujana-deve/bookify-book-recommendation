def test_search_returns_results(page):
    page.goto("http://localhost:5173/")
    page.get_by_placeholder("Search books, authors…").fill("harry potter")
    page.wait_for_timeout(600)  # debounce is 400ms, give it margin
    assert page.get_by_text("No books found").count() == 0