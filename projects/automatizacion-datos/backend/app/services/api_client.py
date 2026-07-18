from datetime import datetime, timezone

import requests

from app.models.sale_record import SaleRecord


class ApiClientService:
    def fetch_sales_data(self, base_url: str, limit: int = 50) -> list[dict]:
        posts = requests.get(f'{base_url.rstrip("/")}/posts', timeout=30).json()
        users = {
            user['id']: user['name']
            for user in requests.get(f'{base_url.rstrip("/")}/users', timeout=30).json()
        }
        extracted_at = datetime.now(timezone.utc)
        records: list[dict] = []

        for index, post in enumerate(posts[:limit]):
            records.append({
                'external_id': post['id'],
                'product_name': post['title'][:80],
                'quantity': (index % 5) + 1,
                'unit_price': round(10 + (index % 20) * 1.5, 2),
                'customer': users.get(post['userId'], 'Cliente desconocido'),
                'extracted_at': extracted_at,
            })
        return records
