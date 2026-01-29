"""
Locust Load Testing for Skyview XC Website

Simulates realistic user traffic patterns to validate performance
under load. Demonstrates performance engineering methodology.

Usage:
    # Local testing against dev server
    locust -f tests/load/locustfile.py --host http://localhost:8000

    # Against production (CloudFront)
    locust -f tests/load/locustfile.py --host https://d9mvm5wuesb39.cloudfront.net

    # Headless mode for CI
    locust -f tests/load/locustfile.py --host http://localhost:8000 \
        --headless -u 50 -r 5 --run-time 60s --csv results/load-test

Metrics tracked:
    - Response time (p50, p95, p99)
    - Throughput (requests/sec)
    - Error rate
    - Page-specific latency
"""

from locust import HttpUser, task, between, events
import time
import logging

logger = logging.getLogger(__name__)


class WebsiteUser(HttpUser):
    """Simulates a typical parent or athlete browsing the XC website."""

    # Realistic think time between page views (2-8 seconds)
    wait_time = between(2, 8)

    def on_start(self):
        """Load homepage on session start - every user does this."""
        self.client.get("/", name="Homepage")

    @task(5)
    def view_homepage(self):
        """Most common action - view the homepage."""
        self.client.get("/", name="Homepage")

    @task(4)
    def view_current_newsletter(self):
        """Parents check the weekly newsletter frequently."""
        self.client.get("/", name="Homepage")
        # Simulate clicking through to newsletter
        self.client.get(
            "/newsletters/week12-newsletter.html", name="Current Newsletter"
        )

    @task(3)
    def browse_newsletter_archive(self):
        """Browse past newsletters."""
        self.client.get("/newsletter-archive.html", name="Newsletter Archive")

    @task(2)
    def check_training(self):
        """Athletes check training info."""
        self.client.get("/training.html", name="Training")

    @task(2)
    def check_results(self):
        """Check race results."""
        self.client.get("/results.html", name="Results")

    @task(1)
    def view_season_plan(self):
        """View the season plan - less frequent."""
        self.client.get("/season-plan.html", name="Season Plan")

    @task(1)
    def view_training_guides(self):
        """Deep dive into training methodology."""
        self.client.get("/training-level-guide.html", name="Training Level Guide")
        self.client.get("/daniels-method-guide.html", name="Daniels Method Guide")

    @task(3)
    def load_static_assets(self):
        """Simulate full page load with CSS and JS."""
        self.client.get("/", name="Homepage")
        self.client.get("/styles/main.css", name="CSS")
        self.client.get("/scripts/theme-toggle.js", name="JavaScript")


class MobileUser(HttpUser):
    """Simulates mobile users with slightly different behavior."""

    wait_time = between(3, 10)
    weight = 3  # 3x more mobile users than desktop

    def on_start(self):
        self.client.get("/", name="Homepage")

    @task(5)
    def quick_newsletter_check(self):
        """Mobile users primarily check the newsletter."""
        self.client.get("/", name="Homepage")
        self.client.get(
            "/newsletters/week12-newsletter.html", name="Current Newsletter"
        )

    @task(2)
    def check_training(self):
        self.client.get("/training.html", name="Training")

    @task(1)
    def check_results(self):
        self.client.get("/results.html", name="Results")


# Custom event hooks for performance reporting
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """Log slow requests for investigation."""
    if response_time > 1000:  # > 1 second
        logger.warning(f"SLOW REQUEST: {name} took {response_time:.0f}ms")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Print summary at end of test."""
    stats = environment.runner.stats

    print("\n" + "=" * 60)
    print("LOAD TEST SUMMARY")
    print("=" * 60)

    total = stats.total
    print(f"Total Requests:  {total.num_requests}")
    print(f"Failed Requests: {total.num_failures}")
    print(f"Error Rate:      {total.fail_ratio:.2%}")
    print(f"Avg Response:    {total.avg_response_time:.0f}ms")
    print(f"p95 Response:    {total.get_response_time_percentile(0.95):.0f}ms")
    print(f"p99 Response:    {total.get_response_time_percentile(0.99):.0f}ms")
    print(f"Requests/sec:    {total.total_rps:.1f}")

    print("\nPerformance Budget Check:")
    p95 = total.get_response_time_percentile(0.95)
    if p95 < 500:
        print(f"  p95 < 500ms: PASS ({p95:.0f}ms)")
    else:
        print(f"  p95 < 500ms: FAIL ({p95:.0f}ms)")

    if total.fail_ratio < 0.01:
        print(f"  Error rate < 1%: PASS ({total.fail_ratio:.2%})")
    else:
        print(f"  Error rate < 1%: FAIL ({total.fail_ratio:.2%})")

    print("=" * 60)
