import json
from datetime import datetime
from pathlib import Path

import pandas as pd


class ReportService:
    def __init__(self, output_dir: str = 'reports'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export_csv(self, records: list[dict], summary: list[dict]) -> str:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        records_path = self.output_dir / f'ventas_{timestamp}.csv'
        summary_path = self.output_dir / f'resumen_{timestamp}.csv'

        pd.DataFrame(records).to_csv(records_path, index=False, encoding='utf-8-sig')
        pd.DataFrame(summary).to_csv(summary_path, index=False, encoding='utf-8-sig')

        return str(records_path)

    def export_json(self, records: list[dict], summary: list[dict]) -> str:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = self.output_dir / f'reporte_{timestamp}.json'

        payload = {
            'generated_at': datetime.now().isoformat(),
            'total_records': len(records),
            'summary': summary,
            'records': records,
        }

        output_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding='utf-8',
        )
        return str(output_path)
