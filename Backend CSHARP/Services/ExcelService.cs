using ClosedXML.Excel;

namespace BackendCSHARP.Services;

public class ExcelService
{
    public async Task<BackendCSHARP.Models.QuoteRequestDto> ProcessExcel(string filePath)
    {
        // Placeholder: podrías leer con ClosedXML si defines un formato de plantilla
        // Aquí retornamos estructura de ejemplo como en los otros backends
        await Task.Yield();
        var cotizacion = new BackendCSHARP.Models.QuoteRequestDto
        {
            Procedimiento = new BackendCSHARP.Models.ProcedureDto
            {
                Nombre = "Procedimiento de ejemplo",
                Descripcion = "Descripción del procedimiento extraída del Excel"
            },
            Materiales = new()
            {
                new BackendCSHARP.Models.MaterialDto{ Descripcion = "Material 1", Cantidad = 2, PrecioUnitario = 100, Total = 200 },
                new BackendCSHARP.Models.MaterialDto{ Descripcion = "Material 2", Cantidad = 3, PrecioUnitario = 150, Total = 450 },
            },
            ManoDeObra = new()
            {
                new BackendCSHARP.Models.LaborDto{ Descripcion = "Trabajo 1", Cantidad = 5, PrecioUnitario = 80, Total = 400 },
                new BackendCSHARP.Models.LaborDto{ Descripcion = "Trabajo 2", Cantidad = 2, PrecioUnitario = 120, Total = 240 },
            },
            Totales = new BackendCSHARP.Models.TotalesDto{ Materiales = 650, ManoDeObra = 640, General = 1290 }
        };
        return cotizacion;
    }
}