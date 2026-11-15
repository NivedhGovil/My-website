#!/usr/bin/env python3
"""Write the GitHub contribution calendar to assets/contributions.json.

The calendar behind the green squares on a GitHub profile is only served by
GitHub's GraphQL API, and that needs a token. A static site cannot hold one,
so this runs in GitHub Actions instead -- once a day -- and commits the
result. The site then reads a plain JSON file, which costs a visitor one
small request and no third-party service.

Run it yourself with:  GH_TOKEN=<a token> python3 -I tools/contributions.py
"""

import datetime
import json
import os
import sys
import urllib.error
import urllib.request

LOGIN = os.environ.get("GH_LOGIN", "NivedhGovil")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "contributions.json")

QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
"""

# GitHub buckets each day into one of five levels; the site draws one shade
# per level, so the numbers travel rather than the names.
LEVELS = {
    "NONE": 0,
    "FIRST_QUARTILE": 1,
    "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3,
    "FOURTH_QUARTILE": 4,
}


def die(message):
    sys.stderr.write("contributions: " + message + "\n")
    sys.exit(1)


def fetch():
    if not TOKEN:
        die("no token. Set GH_TOKEN or GITHUB_TOKEN.")

    body = json.dumps({"query": QUERY, "variables": {"login": LOGIN}}).encode("utf-8")
    request = urllib.request.Request(
        "https://api.github.com/graphql",
        data=body,
        headers={
            "Authorization": "bearer " + TOKEN,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "contribution-calendar-script",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        die("HTTP %s from the GraphQL API: %s" % (err.code, err.read()[:300]))
    except urllib.error.URLError as err:
        die("could not reach the GraphQL API: %s" % err.reason)


def main():
    payload = fetch()

    if payload.get("errors"):
        die("GraphQL refused the query: " + json.dumps(payload["errors"])[:400])

    calendar = (
        ((payload.get("data") or {}).get("user") or {})
        .get("contributionsCollection", {})
        .get("contributionCalendar")
    )

    # Never replace a good calendar with an empty one. A failed fetch should
    # leave yesterday's chart on the site, not wipe it.
    if not calendar or not calendar.get("weeks"):
        die("no calendar came back; leaving the existing file alone.")

    weeks = [
        [
            {
                "d": day["date"],
                "c": day["contributionCount"],
                "l": LEVELS.get(day["contributionLevel"], 0),
            }
            for day in week["contributionDays"]
        ]
        for week in calendar["weeks"]
    ]

    days = sum(len(week) for week in weeks)
    if days < 300:
        die("only %d days came back, which is too few to be the year." % days)

    out = {
        "user": LOGIN,
        "generated": datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
        "total": calendar["totalContributions"],
        "weeks": weeks,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump(out, handle, separators=(",", ":"))
        handle.write("\n")

    print(
        "contributions: %d in the last year, %d days over %d weeks"
        % (out["total"], days, len(weeks))
    )


if __name__ == "__main__":
    main()
