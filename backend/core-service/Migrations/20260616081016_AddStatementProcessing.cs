using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStatementProcessing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StatementUploads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DashboardName = table.Column<string>(type: "character varying(96)", maxLength: 96, nullable: false),
                    FileName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    StoredFilePath = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatementUploads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExtractedTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StatementUploadId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DashboardName = table.Column<string>(type: "character varying(96)", maxLength: 96, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Merchant = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Category = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    TransactionType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtractedTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtractedTransactions_StatementUploads_StatementUploadId",
                        column: x => x.StatementUploadId,
                        principalTable: "StatementUploads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedTransactions_StatementUploadId",
                table: "ExtractedTransactions",
                column: "StatementUploadId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedTransactions_User_Dashboard_Date",
                table: "ExtractedTransactions",
                columns: new[] { "UserId", "DashboardName", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_StatementUploads_User_Status",
                table: "StatementUploads",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StatementUploads_User_UploadedAt",
                table: "StatementUploads",
                columns: new[] { "UserId", "UploadedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExtractedTransactions");

            migrationBuilder.DropTable(
                name: "StatementUploads");
        }
    }
}
