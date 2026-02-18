#!/usr/bin/env python3
"""Big Homes - Camoufox Lead Scraper"""

from camoufox import AsyncCamoufox
import asyncio
import json

async def scrape_plumbers(city="New York"):
    """Scrape plumber leads from Google Maps"""
    
    # Configure Camoufox with geoip and proxy if needed
    async with AsyncCamoufox(
        headless=True,
        geoip=True,  # Matches timezone to IP
        humanize=True,  # Human-like mouse movements
        # Uncomment for proxy:
        # proxy={
        #     'server': 'http://proxy:8080',
        #     'username': 'user',
        #     'password': 'pass'
        # }
    ) as browser:
        
        page = await browser.new_page()
        
        # Go to Google Maps
        url = f"https://www.google.com/maps/search/plumbers+in+{city.replace(' ', '+')}"
        await page.goto(url, wait_until="networkidle")
        
        # Wait for results to load
        await page.wait_for_timeout(3000)
        
        # Scroll to load more results
        for _ in range(5):
            await page.evaluate("document.querySelector('[role=\"feed\"]').scrollBy(0, 1000)")
            await page.wait_for_timeout(1000)
        
        # Extract business listings
        leads = await page.evaluate("""
            () => {
                const businesses = [];
                document.querySelectorAll('[role="article"]').forEach(el => {
                    const name = el.querySelector('h3')?.textContent || '';
                    const rating = el.querySelector('span[aria-label*="stars"]')?.textContent || '';
                    const reviews = el.querySelector('span[aria-label*="review"]')?.textContent || '';
                    const address = el.querySelector('[data-item-id="address"]')?.textContent || '';
                    const phone = el.querySelector('[data-item-id="phone"]')?.textContent || '';
                    const website = el.querySelector('a[data-item-id="website"]')?.href || '';
                    
                    if (name) {
                        businesses.push({
                            name,
                            rating,
                            reviews,
                            address,
                            phone,
                            website,
                            hasWebsite: !!website
                        });
                    }
                });
                return businesses;
            }
        """)
        
        print(f"Found {len(leads)} businesses in {city}")
        
        # Score leads HOT/WARM/COLD
        for lead in leads:
            if not lead['hasWebsite']:
                lead['temperature'] = 'HOT'
            elif lead['reviews'] and int(''.join(filter(str.isdigit, lead['reviews']))) > 10:
                lead['temperature'] = 'WARM'
            else:
                lead['temperature'] = 'COLD'
        
        return leads

async def main():
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
    all_leads = []
    
    for city in cities:
        print(f"Scraping {city}...")
        leads = await scrape_plumbers(city)
        all_leads.extend(leads)
    
    # Save to JSON
    with open('/tmp/leads.json', 'w') as f:
        json.dump(all_leads, f, indent=2)
    
    print(f"Total leads: {len(all_leads)}")
    print("Saved to /tmp/leads.json")

if __name__ == "__main__":
    asyncio.run(main())
