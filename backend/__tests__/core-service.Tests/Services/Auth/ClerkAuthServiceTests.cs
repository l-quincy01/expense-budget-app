

using BudgetlyAI.Services.Auth;
using Clerk.BackendAPI;
using Clerk.BackendAPI.Models.Components;
using Clerk.BackendAPI.Models.Operations;
using Clerk.BackendAPI.Utils;
using Clerk.BackendAPI.Utils.Retries;
using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Auth;

public class ClerkAuthServiceTests
{
    [Fact]
    public async Task GetUserProfileAsync_ReturnsPrimaryEmailAndNames()
    {
        var users = new Mock<IUsers>();
        users.Setup(u => u.GetAsync("user-1", It.IsAny<RetryConfig>()))
            .ReturnsAsync(new GetUserResponse
            {
                User = new User
                {
                    PrimaryEmailAddressId = "primary",
                    EmailAddresses = new List<EmailAddress>
                    {
                        new() { Id = "primary", EmailAddressValue = "primary@example.com" },
                        new() { Id = "secondary", EmailAddressValue = "secondary@example.com" }
                    },
                    FirstName = "Jane",
                    LastName = "Doe"
                }
            });

        var clerk = new ClerkBackendApi(new SDKConfig(Mock.Of<ISpeakeasyHttpClient>()));
        typeof(ClerkBackendApi)
            .GetProperty("Users", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(clerk, users.Object);

        var service = new ClerkAuthService(
            new ConfigurationBuilder().Build(),
            clerk,
            Mock.Of<ILogger<ClerkAuthService>>());

        var profile = await service.GetUserProfileAsync("user-1");

        profile.Should().BeEquivalentTo(new
        {
            userId = "user-1",
            email = "primary@example.com",
            firstName = "Jane",
            lastName = "Doe"
        });
    }

    [Fact]
    public async Task GetUserProfileAsync_FallsBackWhenPrimaryEmailMissing()
    {
        var users = new Mock<IUsers>();
        users.Setup(u => u.GetAsync("user-2", It.IsAny<RetryConfig>()))
            .ReturnsAsync(new GetUserResponse
            {
                User = new User
                {
                    EmailAddresses = new List<EmailAddress>(),
                    FirstName = null,
                    LastName = null
                }
            });

        var clerk = new ClerkBackendApi(new SDKConfig(Mock.Of<ISpeakeasyHttpClient>()));
        typeof(ClerkBackendApi)
            .GetProperty("Users", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(clerk, users.Object);

        var service = new ClerkAuthService(
            new ConfigurationBuilder().Build(),
            clerk,
            Mock.Of<ILogger<ClerkAuthService>>());

        var profile = await service.GetUserProfileAsync("user-2");

        profile.Should().BeEquivalentTo(new
        {
            userId = "user-2",
            email = "unknown",
            firstName = "User",
            lastName = string.Empty
        });
    }
}
