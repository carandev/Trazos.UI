using Microsoft.AspNetCore.Components.Forms;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Forms;

public class FileInputTests : BunitContext
{
    public FileInputTests() => JSInterop.Mode = JSRuntimeMode.Loose;

    [Fact]
    public void Accepted_files_are_listed_and_can_be_removed()
    {
        IReadOnlyList<IBrowserFile>? files = null;
        var cut = Render<FileInput>(p => p
            .Add(x => x.Multiple, true)
            .Add(x => x.Accept, ".pdf,image/*")
            .Add(x => x.RemoveLabelFormat, "Quitar {0}")
            .Add(x => x.ValueChanged, (IReadOnlyList<IBrowserFile>? v) => files = v));

        cut.FindComponent<InputFile>().UploadFiles(
            InputFileContent.CreateFromText("a", "contract.pdf", contentType: "application/pdf"),
            InputFileContent.CreateFromText("b", "photo.png", contentType: "image/png"));

        Assert.Equal(["contract.pdf", "photo.png"], files!.Select(f => f.Name));
        var items = cut.FindAll(".trazos-file-item-name").Select(e => e.TextContent).ToList();
        Assert.Equal(["contract.pdf", "photo.png"], items);
        Assert.Equal(".pdf,image/*", cut.Find("input[type='file']").GetAttribute("accept"));

        cut.Find("button[aria-label='Quitar contract.pdf']").Click();

        Assert.Equal(["photo.png"], files!.Select(f => f.Name));
    }

    [Fact]
    public void Files_with_the_wrong_type_or_size_are_rejected_with_a_message()
    {
        IReadOnlyList<IBrowserFile>? files = null;
        var cut = Render<FileInput>(p => p
            .Add(x => x.Multiple, true)
            .Add(x => x.Accept, ".pdf")
            .Add(x => x.MaxFileSize, 3)
            .Add(x => x.ValueChanged, (IReadOnlyList<IBrowserFile>? v) => files = v));

        cut.FindComponent<InputFile>().UploadFiles(
            InputFileContent.CreateFromText("ok", "a.pdf", contentType: "application/pdf"),
            InputFileContent.CreateFromText("too large", "b.pdf", contentType: "application/pdf"),
            InputFileContent.CreateFromText("x", "c.exe", contentType: "application/octet-stream"));

        Assert.Equal(["a.pdf"], files!.Select(f => f.Name));
        var errors = cut.FindAll(".trazos-file-rejected li").Select(e => e.TextContent).ToList();
        Assert.Equal(["b.pdf is larger than 3 B.", "c.exe is not an accepted file type."], errors);
    }

    [Fact]
    public void A_single_file_input_replaces_the_previous_file()
    {
        IReadOnlyList<IBrowserFile>? files = null;
        var cut = Render<FileInput>(p => p.Add(x => x.ValueChanged, (IReadOnlyList<IBrowserFile>? v) => files = v));

        cut.FindComponent<InputFile>().UploadFiles(InputFileContent.CreateFromText("1", "first.txt"));
        cut.FindComponent<InputFile>().UploadFiles(InputFileContent.CreateFromText("2", "second.txt"));

        Assert.Equal(["second.txt"], files!.Select(f => f.Name));
        Assert.False(cut.Find("input[type='file']").HasAttribute("multiple"));
    }

    [Fact]
    public void A_rejected_file_keeps_the_previous_selection()
    {
        IReadOnlyList<IBrowserFile>? files = null;
        var cut = Render<FileInput>(p => p
            .Add(x => x.Accept, ".pdf")
            .Add(x => x.ValueChanged, (IReadOnlyList<IBrowserFile>? v) => files = v));

        cut.FindComponent<InputFile>().UploadFiles(InputFileContent.CreateFromText("1", "good.pdf", contentType: "application/pdf"));
        cut.FindComponent<InputFile>().UploadFiles(InputFileContent.CreateFromText("2", "bad.exe"));

        Assert.Equal(["good.pdf"], files!.Select(f => f.Name));
        Assert.Single(cut.FindAll(".trazos-file-item"));
        Assert.Single(cut.FindAll(".trazos-file-rejected li"));
    }
}
