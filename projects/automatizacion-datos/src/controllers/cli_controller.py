from src.services.etl_service import EtlService


class CliController:
    def __init__(self, etl_service: EtlService | None = None):
        self.etl_service = etl_service or EtlService()

    def execute(self) -> None:
        print('=== Automatización de Datos Empresariales ===')
        print('Iniciando pipeline ETL...\n')

        result = self.etl_service.run_pipeline()

        print(f'Registros extraídos: {result["extracted"]}')
        print(f'Registros guardados:  {result["saved"]}')
        print(f'Reporte CSV:          {result["csv_report"]}')
        print(f'Reporte JSON:         {result["json_report"]}')
        print('\nResumen por cliente:')

        for item in result['summary']:
            print(
                f"  - {item['customer']}: "
                f"{item['total_orders']} pedidos, "
                f"${item['total_sales']:.2f}"
            )

        print('\nPipeline completado exitosamente.')
