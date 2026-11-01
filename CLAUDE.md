# CLAUDE.md

## North Star
- Positioning: a fun, shareable personality test (MBTI + zodiac + numerology) for Vietnamese students. Entertainment first, not career advice.
- North Star metric: share_rate = share_success events / result_view events, measured per completed test.
- Guardrail metric: completion_rate = result_view / test_start (we must not grow sharing by making the test worse to finish).
- Privacy rule: never send full name or date of birth to analytics, URLs, or any external service.
- Decision rule: every new feature must state how it raises share_rate; if it doesn't, it waits.
