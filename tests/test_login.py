import os

TEST_USERNAME = os.getenv("TEST_USERNAME", "tester1")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "alp123@#")

def test_login_sucess(page):
    page.goto("http://localhost:5173/login")
    page.get_by_placeholder('yourusername').fill(TEST_USERNAME)
    page.get_by_placeholder("••••••••").fill(TEST_PASSWORD)
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url(lambda url: "/login" not in url)
    assert "/login" not in page.url

#testing for the wrong password
def test_login_fail(page):
    page.goto("http://localhost:5173/login")
    page.get_by_placeholder("yourusername").fill(TEST_USERNAME)
    page.get_by_placeholder("••••••••").fill("wrongpassword")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(1000)
    assert "/login" in page.url

def test_login_fail_username(page):
    page.goto("http://localhost:5173/login")
    page.get_by_placeholder("yourusername").fill("nonexistentuser")
    page.get_by_placeholder("••••••••").fill(TEST_PASSWORD)
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(1000)
    assert "/login" in page.url