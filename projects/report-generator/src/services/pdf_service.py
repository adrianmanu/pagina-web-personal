import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from src.models.report_request import ReportRequest


class PdfReportService:
    def generate(self, request: ReportRequest) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            textColor=colors.HexColor('#6366f1'),
        )

        elements = [
            Paragraph(request.title, title_style),
            Paragraph(f'Autor: {request.author}', styles['Normal']),
            Spacer(1, 20),
        ]

        table_data = [['Categoría', 'Concepto', 'Valor']]
        for item in request.items:
            table_data.append([item.category, item.label, f'${item.value:,.2f}'])

        table = Table(table_data, colWidths=[120, 240, 100])
        table.setStyle(
            TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
            ])
        )

        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()
