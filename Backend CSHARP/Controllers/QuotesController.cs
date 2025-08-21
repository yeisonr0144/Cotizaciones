using BackendCSHARP.Db;
using BackendCSHARP.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace BackendCSHARP.Controllers;

[ApiController]
[Route("api")]
public class QuotesController : ControllerBase
{
    private readonly SqlConnectionFactory _factory;

    public QuotesController(SqlConnectionFactory factory)
    {
        _factory = factory;
    }

    [HttpGet("db-ping")]
    public async Task<IActionResult> DbPing()
    {
        try
        {
            await using var conn = _factory.CreateConnection();
            await conn.OpenAsync();
            await using var cmd = new SqlCommand("SELECT SUSER_SNAME() as LoginName, DB_NAME() as DbName, @@SERVERNAME as ServerName", conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            string? login = null, db = null, srv = null;
            if (await reader.ReadAsync())
            {
                login = reader.IsDBNull(0) ? null : reader.GetString(0);
                db = reader.IsDBNull(1) ? null : reader.GetString(1);
                srv = reader.IsDBNull(2) ? null : reader.GetString(2);
            }
            return Ok(new { success = true, login, db, server = srv });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("quotes")]
    public async Task<IActionResult> GetQuotes()
    {
        try
        {
            await using var conn = _factory.CreateConnection();
            await conn.OpenAsync();

            // Verificar tablas
            var checkCmd = new SqlCommand(@"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME IN ('Cotizaciones','Procedimientos')", conn);
            var found = new List<string>();
            await using (var reader = await checkCmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                    found.Add(reader.GetString(0));
            }
            if (found.Count < 2)
            {
                return StatusCode(500, new { success = false, message = "Las tablas necesarias no existen en la base de datos. Por favor ejecuta el script database.sql primero.", tablesFound = found });
            }

            // Consultar cotizaciones
            var cmd = new SqlCommand(@"SELECT c.id, c.total_general, c.pdf_path, c.fecha_creacion, p.nombre, p.descripcion
                                       FROM Cotizaciones c
                                       JOIN Procedimientos p ON c.procedimiento_id = p.id
                                       ORDER BY c.fecha_creacion DESC", conn);
            var list = new List<object>();
            await using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    list.Add(new
                    {
                        id = reader.GetInt32(0),
                        total_general = reader.GetDecimal(1),
                        pdf_path = reader.IsDBNull(2) ? null : reader.GetString(2),
                        fecha_creacion = reader.GetDateTime(3),
                        nombre = reader.GetString(4),
                        descripcion = reader.IsDBNull(5) ? null : reader.GetString(5)
                    });
                }
            }

            return Ok(new { success = true, cotizaciones = list });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error al obtener cotizaciones: {ex}");
            return StatusCode(500, new { success = false, message = "Error al obtener las cotizaciones", error = ex.Message });
        }
    }

    [HttpPost("save-quote")]
    public async Task<IActionResult> SaveQuote([FromBody] QuoteRequestDto request)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            // Insert procedimiento
            var cmdProc = new SqlCommand(@"INSERT INTO Procedimientos (nombre, descripcion, fecha_creacion)
                                           VALUES (@n, @d, @f); SELECT CAST(SCOPE_IDENTITY() as int);", conn, (SqlTransaction)tx);
            cmdProc.Parameters.Add(new("@n", SqlDbType.NVarChar, 255) { Value = request.Procedimiento?.Nombre ?? string.Empty });
            cmdProc.Parameters.Add(new("@d", SqlDbType.NVarChar) { Value = (object?)request.Procedimiento?.Descripcion ?? DBNull.Value });
            cmdProc.Parameters.Add(new("@f", SqlDbType.DateTime) { Value = DateTime.Now });
            var procedimientoId = (int)(await cmdProc.ExecuteScalarAsync() ?? 0);

            // Insert cotizacion
            var cmdCot = new SqlCommand(@"INSERT INTO Cotizaciones (procedimiento_id, total_materiales, total_mano_obra, total_general, pdf_path, fecha_creacion)
                                         VALUES (@pid, @tm, @tmo, @tg, @pdf, @f); SELECT CAST(SCOPE_IDENTITY() as int);", conn, (SqlTransaction)tx);
            cmdCot.Parameters.AddWithValue("@pid", procedimientoId);
            cmdCot.Parameters.AddWithValue("@tm", request.Totales?.Materiales ?? 0);
            cmdCot.Parameters.AddWithValue("@tmo", request.Totales?.ManoDeObra ?? 0);
            cmdCot.Parameters.AddWithValue("@tg", request.Totales?.General ?? 0);
            cmdCot.Parameters.Add(new("@pdf", SqlDbType.NVarChar, 255) { Value = (object?)request.PdfPath ?? DBNull.Value });
            cmdCot.Parameters.Add(new("@f", SqlDbType.DateTime) { Value = DateTime.Now });
            var cotizacionId = (int)(await cmdCot.ExecuteScalarAsync() ?? 0);

            // Insert materiales
            if (request.Materiales != null)
            {
                foreach (var m in request.Materiales)
                {
                    var cmdMat = new SqlCommand(@"INSERT INTO Materiales (cotizacion_id, descripcion, cantidad, precio_unitario, total)
                                                  VALUES (@cid, @desc, @cant, @pu, @tot)", conn, (SqlTransaction)tx);
                    cmdMat.Parameters.AddWithValue("@cid", cotizacionId);
                    cmdMat.Parameters.Add(new("@desc", SqlDbType.NVarChar, 255) { Value = m.Descripcion });
                    cmdMat.Parameters.AddWithValue("@cant", m.Cantidad);
                    cmdMat.Parameters.AddWithValue("@pu", m.PrecioUnitario);
                    cmdMat.Parameters.AddWithValue("@tot", m.Total);
                    await cmdMat.ExecuteNonQueryAsync();
                }
            }

            // Insert mano de obra
            if (request.ManoDeObra != null)
            {
                foreach (var w in request.ManoDeObra)
                {
                    var cmdWork = new SqlCommand(@"INSERT INTO ManoDeObra (cotizacion_id, descripcion, cantidad, precio_unitario, total)
                                                   VALUES (@cid, @desc, @cant, @pu, @tot)", conn, (SqlTransaction)tx);
                    cmdWork.Parameters.AddWithValue("@cid", cotizacionId);
                    cmdWork.Parameters.Add(new("@desc", SqlDbType.NVarChar, 255) { Value = w.Descripcion });
                    cmdWork.Parameters.AddWithValue("@cant", w.Cantidad);
                    cmdWork.Parameters.AddWithValue("@pu", w.PrecioUnitario);
                    cmdWork.Parameters.AddWithValue("@tot", w.Total);
                    await cmdWork.ExecuteNonQueryAsync();
                }
            }

            await tx.CommitAsync();
            return Ok(new { success = true, cotizacionId });
        }
        catch (Exception ex)
        {
            try { await tx.RollbackAsync(); } catch { }
            Console.Error.WriteLine($"Error al guardar la cotización: {ex}");
            return StatusCode(500, new { success = false, message = "Error al guardar la cotización en la base de datos" });
        }
    }
}