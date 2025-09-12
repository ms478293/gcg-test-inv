#!/usr/bin/env python3
import requests
import json

# Test database content by checking products
response = requests.get('https://gcgelegance.preview.emergentagent.com/api/products')
if response.status_code == 200:
    products = response.json()
    print(f'Found {len(products)} products in database:')
    for product in products:
        print(f'  - {product["name"]} ({product["collection"]}) - ${product["price"]} - {product["type"]}')
        
    # Check collections
    response = requests.get('https://gcgelegance.preview.emergentagent.com/api/collections/active')
    if response.status_code == 200:
        collections = response.json()
        print(f'\nFound {len(collections)} collections:')
        for collection in collections:
            print(f'  - {collection["name"]} (slug: {collection["slug"]})')
else:
    print(f'Error: {response.status_code} - {response.text}')