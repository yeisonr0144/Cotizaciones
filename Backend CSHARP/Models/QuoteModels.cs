namespace BackendCSHARP.Models;

public class ProcedureDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class MaterialDto
{
    public string Descripcion { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Total { get; set; }
}

public class LaborDto
{
    public string Descripcion { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Total { get; set; }
}

public class TotalesDto
{
    public decimal Materiales { get; set; }
    public decimal ManoDeObra { get; set; }
    public decimal General { get; set; }
}

public class QuoteRequestDto
{
    public ProcedureDto Procedimiento { get; set; } = new();
    public List<MaterialDto> Materiales { get; set; } = new();
    public List<LaborDto> ManoDeObra { get; set; } = new();
    public TotalesDto Totales { get; set; } = new();
    public string? PdfPath { get; set; }
}