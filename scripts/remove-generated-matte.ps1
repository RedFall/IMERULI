param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

if (-not ('GeneratedMatteRemover' -as [type])) {
  Add-Type -ReferencedAssemblies 'System.Drawing' -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class GeneratedMatteRemover
{
    private static bool IsBackdrop(byte r, byte g, byte b)
    {
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        int average = (r + g + b) / 3;
        return average >= 232 && max - min <= 24;
    }

    public static void Remove(string inputPath, string outputPath)
    {
        using (var source = new Bitmap(inputPath))
        using (var bitmap = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(bitmap))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            var bounds = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
            var data = bitmap.LockBits(bounds, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            int byteCount = Math.Abs(stride) * bitmap.Height;
            var pixels = new byte[byteCount];
            Marshal.Copy(data.Scan0, pixels, 0, byteCount);

            int width = bitmap.Width;
            int height = bitmap.Height;
            var transparent = new bool[width * height];
            var queue = new Queue<int>();

            Action<int, int> enqueue = (x, y) =>
            {
                int position = y * stride + x * 4;
                int index = y * width + x;
                if (transparent[index]) return;
                if (!IsBackdrop(pixels[position + 2], pixels[position + 1], pixels[position])) return;
                transparent[index] = true;
                queue.Enqueue(index);
            };

            for (int x = 0; x < width; x++)
            {
                enqueue(x, 0);
                enqueue(x, height - 1);
            }
            for (int y = 1; y < height - 1; y++)
            {
                enqueue(0, y);
                enqueue(width - 1, y);
            }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;
                if (x > 0) enqueue(x - 1, y);
                if (x + 1 < width) enqueue(x + 1, y);
                if (y > 0) enqueue(x, y - 1);
                if (y + 1 < height) enqueue(x, y + 1);
            }

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int index = y * width + x;
                    int position = y * stride + x * 4;
                    if (transparent[index])
                    {
                        pixels[position] = 0;
                        pixels[position + 1] = 0;
                        pixels[position + 2] = 0;
                        pixels[position + 3] = 0;
                        continue;
                    }

                    bool touchesTransparency =
                        (x > 0 && transparent[index - 1]) ||
                        (x + 1 < width && transparent[index + 1]) ||
                        (y > 0 && transparent[index - width]) ||
                        (y + 1 < height && transparent[index + width]);

                    if (!touchesTransparency) continue;

                    byte b = pixels[position];
                    byte g = pixels[position + 1];
                    byte r = pixels[position + 2];
                    int max = Math.Max(r, Math.Max(g, b));
                    int min = Math.Min(r, Math.Min(g, b));
                    int average = (r + g + b) / 3;
                    if (average < 220 || max - min > 32) continue;

                    int alpha = Math.Max(0, Math.Min(255, (235 - average) * 17));
                    if (alpha == 0)
                    {
                        pixels[position] = 0;
                        pixels[position + 1] = 0;
                        pixels[position + 2] = 0;
                        pixels[position + 3] = 0;
                        continue;
                    }

                    pixels[position + 3] = (byte)alpha;
                    pixels[position] = Unmatte(b, alpha);
                    pixels[position + 1] = Unmatte(g, alpha);
                    pixels[position + 2] = Unmatte(r, alpha);
                }
            }

            Marshal.Copy(pixels, 0, data.Scan0, byteCount);
            bitmap.UnlockBits(data);

            string directory = Path.GetDirectoryName(outputPath);
            if (!String.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);
            bitmap.Save(outputPath, ImageFormat.Png);
        }
    }

    private static byte Unmatte(int channel, int alpha)
    {
        int value = 255 + (channel - 255) * 255 / alpha;
        return (byte)Math.Max(0, Math.Min(255, value));
    }
}
'@
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
[GeneratedMatteRemover]::Remove($resolvedInput, $resolvedOutput)

$image = [System.Drawing.Image]::FromFile($resolvedOutput)
try {
  [PSCustomObject]@{
    Path = $resolvedOutput
    Width = $image.Width
    Height = $image.Height
    PixelFormat = $image.PixelFormat.ToString()
    Bytes = (Get-Item -LiteralPath $resolvedOutput).Length
  }
}
finally {
  $image.Dispose()
}
