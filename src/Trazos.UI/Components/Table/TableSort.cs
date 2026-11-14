namespace Trazos.UI.Components;

/// <summary>Sort state of a <see cref="DataTable{TItem}"/>: the column field and its direction.</summary>
public sealed record TableSort(string Field, bool Descending = false);

/// <summary>Horizontal alignment of a table column.</summary>
public enum TableAlign
{
    Start,
    Center,
    End,
}

/// <summary>What a <see cref="SortHeader"/> needs from the table around it.</summary>
public interface IDataTableSortContext
{
    TableSort? Sort { get; }

    Task ToggleSortAsync(string field);
}
