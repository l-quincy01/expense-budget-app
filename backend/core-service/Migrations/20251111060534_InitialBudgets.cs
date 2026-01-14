using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialBudgets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserAddedBudgets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DashboardName = table.Column<string>(type: "character varying(96)", maxLength: 96, nullable: false),
                    Category = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BudgetAmount = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    SpentAmount = table.Column<decimal>(type: "numeric(14,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAddedBudgets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserAddedTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DashboardName = table.Column<string>(type: "character varying(96)", maxLength: 96, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAddedTransactions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserBudget_Composite",
                table: "UserAddedBudgets",
                columns: new[] { "UserId", "DashboardName", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_UserTransactions_Lookup",
                table: "UserAddedTransactions",
                columns: new[] { "UserId", "DashboardName", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserAddedBudgets");

            migrationBuilder.DropTable(
                name: "UserAddedTransactions");
        }
    }
}
