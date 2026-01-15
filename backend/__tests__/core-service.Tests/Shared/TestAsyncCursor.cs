using MongoDB.Driver;

namespace CoreService.Tests.Shared;

public sealed class TestAsyncCursor<T> : IAsyncCursor<T>
{
    private readonly IReadOnlyList<T> _items;
    private bool _moved;

    public TestAsyncCursor(IEnumerable<T> items)
    {
        _items = items.ToList();
        Current = Array.Empty<T>();
    }

    public IEnumerable<T> Current { get; private set; }

    public bool MoveNext(CancellationToken cancellationToken = default)
    {
        if (_moved) return false;

        _moved = true;
        Current = _items;
        return true;
    }

    public Task<bool> MoveNextAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(MoveNext(cancellationToken));

    public void Dispose() { }
}
