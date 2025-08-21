using BackendCSHARP.Models;
using BackendCSHARP.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendCSHARP.Controllers;

[ApiController]
[Route("api")]
public class FilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ExcelService _excelService;
    private readonly PdfService _pdfService;

    public FilesController(IWebHostEnvironment env, ExcelService excelService, PdfService pdfService)
    {
        _env = env;
        _excelService = excelService;
        _pdfService = pdfService;
    }

    [HttpPost("generate-quote")]
    public async Task<IActionResult> GenerateQuote([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "No se ha subido ningún archivo" });

        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var filePath = Path.Combine(uploadsDir, $"{DateTimeOffset.Now.ToUnixTimeMilliseconds()}{Path.GetExtension(file.FileName)}");
        try
        {
            using (var stream = System.IO.File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }
            var cotizacion = await _excelService.ProcessExcel(filePath);
            return Ok(new { success = true, cotizacion });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error al procesar Excel: {ex}");
            return StatusCode(500, new { success = false, message = "Error al procesar el archivo Excel" });
        }
        finally
        {
            try { System.IO.File.Delete(filePath); } catch { }
        }
    }

    [HttpPost("generate-pdf")]
    public IActionResult GeneratePdf([FromBody] QuoteRequestDto request)
    {
        try
        {
            var outputDir = Path.Combine(_env.ContentRootPath, "output");
            Directory.CreateDirectory(outputDir);
            var filename = _pdfService.GeneratePdf(request, outputDir);
            return Ok(new { success = true, pdfPath = $"/api/download-pdf/{filename}" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error en la generación del PDF: {ex}");
            return StatusCode(500, new { success = false, message = "Error en la generación del PDF" });
        }
    }

    [HttpGet("download-pdf/{filename}")]
    public IActionResult DownloadPdf([FromRoute] string filename)
    {
        var outputDir = Path.Combine(_env.ContentRootPath, "output");
        var filePath = Path.Combine(outputDir, filename);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { success = false, message = "Archivo no encontrado" });

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(stream, "application/pdf", enableRangeProcessing: true);
    }
}