#!/usr/bin/env python3
"""Big Homes - Camoufox Scraper Example"""

from camoufox.asyncio import Camoufox

async def scrape():
    async with Camoufox(geoip=True) as browser:
        page = await browser.new_page()
        
        # Go to a site (e.g., Google Maps for lead scraping)
        await page.goto("https://www.google.com/maps")
        
        # Your scraping logic here
        print("Browser ready with geoip spoofing!")
        
        # Example: Search for plumbers in NYC
        # await page.fill('input[aria-label="Search"]', 'plumbers NYC')
        # await page.press('input[aria-label="Search"]', 'Enter')
        
        await page.wait_for_timeout(5000)
        
if __name__ == "__main__":
    import asyncio
    asyncio.run(scrape())
