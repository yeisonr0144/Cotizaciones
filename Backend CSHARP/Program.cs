using BackendCSHARP.Db;
using BackendCSHARP.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Logging detallado para diagnosticar conexión
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Cotizaciones API", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// DI
builder.Services.AddSingleton<SqlConnectionFactory>();
builder.Services.AddSingleton<ExcelService>();
builder.Services.AddSingleton<PdfService>();

var app = builder.Build();

// Swagger disponible siempre
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.UseAuthorization();

app.MapGet("/", () => Results.Json(new { status = "ok", message = "Backend C# en ejecución" }));

app.MapControllers();

app.Run();