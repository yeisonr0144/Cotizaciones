using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BackendCSHARP.Db;

public class SqlConnectionFactory
{
    private readonly IConfiguration _config;
    private readonly ILogger<SqlConnectionFactory> _logger;

    public SqlConnectionFactory(IConfiguration config, ILogger<SqlConnectionFactory> logger)
    {
        _config = config;
        _logger = logger;
    }

    public SqlConnection CreateConnection()
    {
        var db = _config.GetSection("Database");
        var explicitDataSource = db.GetValue<string>("DataSource");
        var server = db.GetValue<string>("Server");
        var database = db.GetValue<string>("Database");
        var user = db.GetValue<string>("User");
        var password = db.GetValue<string>("Password");
        var port = db.GetValue<int>("Port", 1433);
        var encrypt = db.GetValue<bool>("Encrypt", false);
        var trust = db.GetValue<bool>("TrustServerCertificate", true);
        var integrated = db.GetValue<bool>("IntegratedSecurity", false);
        var usePortWithNamed = db.GetValue<bool>("UsePortWithNamedInstance", false);

        // Determinar DataSource
        string dataSource = explicitDataSource;
        if (string.IsNullOrWhiteSpace(dataSource))
        {
            dataSource = server ?? string.Empty;
            var hasInstance = !string.IsNullOrWhiteSpace(server) && server.Contains("\\");
            if (port > 0 && (!hasInstance || usePortWithNamed))
            {
                dataSource = $"{server},{port}";
            }
        }

        var builder = new SqlConnectionStringBuilder
        {
            DataSource = dataSource,
            InitialCatalog = database,
            TrustServerCertificate = trust,
            Encrypt = encrypt,
            IntegratedSecurity = integrated
        };

        if (!integrated)
        {
            builder.UserID = user;
            builder.Password = password;
        }

        _logger.LogInformation("SQL Connection - DataSource: {ds}, Database: {db}, Integrated: {intSec}, Encrypt: {enc}, TrustCert: {trust}",
            builder.DataSource, builder.InitialCatalog, builder.IntegratedSecurity, builder.Encrypt, builder.TrustServerCertificate);

        return new SqlConnection(builder.ConnectionString);
    }
}