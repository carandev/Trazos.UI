using System.Runtime.CompilerServices;

namespace Trazos.UI.Tests.Fixtures;

public static class RepoPaths
{
    /// <summary>Absolute path of a file in the repository, resolved from this source file.</summary>
    public static string File(string relativePath, [CallerFilePath] string here = "") =>
        Path.GetFullPath(Path.Combine(Path.GetDirectoryName(here)!, "..", "..", "..", relativePath));
}
