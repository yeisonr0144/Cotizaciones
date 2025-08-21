using BackendCSHARP.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BackendCSHARP.Services;

public class PdfService
{
    private static string Format(decimal value) => string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0:N2}", value).Replace(",", "_").Replace(".", ",").Replace("_", ".");

    public string GeneratePdf(QuoteRequestDto data, string outputDir)
    {
        Directory.CreateDirectory(outputDir);
        var filename = $"cotizacion-{DateTimeOffset.Now.ToUnixTimeMilliseconds()}.pdf";
        var pdfPath = Path.Combine(outputDir, filename);

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);

                page.Header().Row(row =>
                {
                    row.RelativeItem().AlignCenter().Text("COTIZACIÓN").Bold().FontSize(20);
                    row.ConstantItem(140).Text($"Fecha: {DateTime.Now:dd/MM/yyyy}").AlignRight();
                });

                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    // Procedimiento
                    col.Item().Text("Información del Procedimiento").Bold().FontSize(14);
                    col.Item().Text($"Nombre: {data.Procedimiento?.Nombre ?? string.Empty}");
                    col.Item().Text($"Descripción: {data.Procedimiento?.Descripcion ?? string.Empty}");

                    // Materiales
                    if (data.Materiales?.Count > 0)
                    {
                        col.Item().Text("Materiales").Bold().FontSize(14);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(5);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(3);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellHeader).Text("Descripción");
                                header.Cell().Element(CellHeader).Text("Cantidad");
                                header.Cell().Element(CellHeader).Text("Precio Unitario");
                                header.Cell().Element(CellHeader).Text("Total");

                                static IContainer CellHeader(IContainer container)
                                    => container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(4).BorderBottom(1).BorderColor(Colors.Grey.Medium);
                            });

                            foreach (var m in data.Materiales)
                            {
                                table.Cell().Text(m.Descripcion);
                                table.Cell().Text(m.Cantidad.ToString());
                                table.Cell().Text($"${Format(m.PrecioUnitario)}");
                                table.Cell().Text($"${Format(m.Total)}");
                            }
                        });

                        col.Item().AlignRight().Text($"Total Materiales: ${Format(data.Totales?.Materiales ?? 0)}");
                    }

                    // Mano de Obra
                    if (data.ManoDeObra?.Count > 0)
                    {
                        col.Item().Text("Mano de Obra").Bold().FontSize(14);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(5);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(3);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellHeader).Text("Descripción");
                                header.Cell().Element(CellHeader).Text("Cantidad");
                                header.Cell().Element(CellHeader).Text("Precio Unitario");
                                header.Cell().Element(CellHeader).Text("Total");

                                static IContainer CellHeader(IContainer container)
                                    => container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(4).BorderBottom(1).BorderColor(Colors.Grey.Medium);
                            });

                            foreach (var w in data.ManoDeObra)
                            {
                                table.Cell().Text(w.Descripcion);
                                table.Cell().Text(w.Cantidad.ToString());
                                table.Cell().Text($"${Format(w.PrecioUnitario)}");
                                table.Cell().Text($"${Format(w.Total)}");
                            }
                        });

                        col.Item().AlignRight().Text($"Total Mano de Obra: ${Format(data.Totales?.ManoDeObra ?? 0)}");
                    }

                    // Totales
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().AlignLeft().Text("");
                        row.ConstantItem(240).Column(c =>
                        {
                            c.Item().Text($"Total Materiales: ${Format(data.Totales?.Materiales ?? 0)}");
                            c.Item().Text($"Total Mano de Obra: ${Format(data.Totales?.ManoDeObra ?? 0)}");
                            c.Item().Text($"TOTAL GENERAL: ${Format(data.Totales?.General ?? 0)}").Bold();
                        });
                    });
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Documento generado automáticamente.").FontSize(9);
                });
            });
        }).GeneratePdf(pdfPath);

        return filename;
    }
}