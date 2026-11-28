"""Headless balance check for Abyssal Appetite.

Drives the game with a simple human-like bot (0.3 s reactions, only sees what's on
screen or inside the light radius) and prints survival time, score and when each
size stage was reached.

Usage (needs Python Playwright + Chromium):
    pip install playwright && playwright install chromium
    python tools/balance.py                   # 6 dives of 12 minutes on index.html
    python tools/balance.py play-v030.html 4 8  # file, dives, minutes
"""
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

async def main(file='index.html', runs=6, minutes=12):
    url = (ROOT / file).as_uri() + ('?debug' if file == 'index.html' else '')
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=__import__('os').environ.get('CHROME_PATH') or None)
        page = await (await browser.new_context(viewport={'width': 900, 'height': 560})).new_page()
        await page.goto(url); await page.wait_for_timeout(300)
        bot = (ROOT / 'tools' / 'balance-bot.js').read_text()
        res = await page.evaluate(bot, {'runs': runs, 'minutes': minutes})
        for r in res:
            s = r['stageAt']
            print(f"{r['min']:>5} min  score {r['score']:>8}  level {r['level']:>3}  hits {r['hits']:>3}  "
                  f"hunter {s.get('hunter', '-')}  apex {s.get('apex', '-')}  leviathan {s.get('leviathan', '-')}  "
                  f"titan {s.get('titan', '-')}  {r['cause']}")
        await browser.close()

if __name__ == '__main__':
    a = sys.argv[1:]
    asyncio.run(main(a[0] if a else 'index.html', int(a[1]) if len(a) > 1 else 6, float(a[2]) if len(a) > 2 else 12))
