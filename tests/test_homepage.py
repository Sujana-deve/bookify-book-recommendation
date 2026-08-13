def test_homepage_loads(page):
    page.goto("http://localhost:5173/")
    assert "frontend" in page.title()

