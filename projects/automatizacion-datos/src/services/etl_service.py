from src.repositories.database import DatabaseRepository
from src.services.api_client import ApiClientService
from src.services.report_service import ReportService


class EtlService:
    def __init__(
        self,
        api_client: ApiClientService | None = None,
        repository: DatabaseRepository | None = None,
        report_service: ReportService | None = None,
    ):
        self.api_client = api_client or ApiClientService()
        self.repository = repository or DatabaseRepository()
        self.report_service = report_service or ReportService()

    def run_pipeline(self) -> dict:
        records = self.api_client.fetch_sales_data()
        saved_count = self.repository.save_records(records)

        all_records = self.repository.get_all_records()
        summary = self.repository.get_summary()

        csv_path = self.report_service.export_csv(all_records, summary)
        json_path = self.report_service.export_json(all_records, summary)

        return {
            'extracted': len(records),
            'saved': saved_count,
            'csv_report': csv_path,
            'json_report': json_path,
            'summary': summary,
        }
