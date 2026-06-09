import os
from datetime import datetime, timezone

import requests

from src.models import SaleRecord


class ApiClientService:
    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or os.getenv(
            'API_BASE_URL',
            'https://jsonplaceholder.typicode.com',
        )

    def fetch_sales_data(self) -> list[SaleRecord]:
        posts = requests.get(f'{self.base_url}/posts', timeout=30).json()
        users = {
            user['id']: user['name']
            for user in requests.get(f'{self.base_url}/users', timeout=30).json()
        }

        records: list[SaleRecord] = []
        extracted_at = datetime.now(timezone.utc)

        for index, post in enumerate(posts[:50]):
            records.append(
                SaleRecord(
                    external_id=post['id'],
                    product_name=post['title'][:80],
                    quantity=(index % 5) + 1,
                    unit_price=round(10 + (index % 20) * 1.5, 2),
                    customer=users.get(post['userId'], 'Cliente desconocido'),
                    extracted_at=extracted_at,
                )
            )

        return records
