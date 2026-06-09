from fastapi import APIRouter
from fastapi.responses import Response

from src.models.report_request import ReportRequest
from src.services.excel_service import ExcelReportService
from src.services.pdf_service import PdfReportService

router = APIRouter(prefix='/reports', tags=['reports'])
pdf_service = PdfReportService()
excel_service = ExcelReportService()


@router.post('/pdf')
def generate_pdf(request: ReportRequest) -> Response:
    content = pdf_service.generate(request)
    return Response(
        content=content,
        media_type='application/pdf',
        headers={'Content-Disposition': 'attachment; filename=reporte.pdf'},
    )


@router.post('/excel')
def generate_excel(request: ReportRequest) -> Response:
    content = excel_service.generate(request)
    return Response(
        content=content,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=reporte.xlsx'},
    )
