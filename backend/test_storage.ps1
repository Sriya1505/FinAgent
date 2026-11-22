try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    Add-Type -AssemblyName System.Drawing
    $bytes = [System.IO.File]::ReadAllBytes("C:\Users\SRIYA\.gemini\antigravity\scratch\FinAgent\backend\test_page2.png")
    $ms = [System.IO.MemoryStream]::new($bytes)
    
    $asRandomAccessStream = [System.IO.WindowsRuntimeStreamExtensions].GetMethod("AsRandomAccessStream", [Type[]]@([System.IO.Stream]))
    $ras = $asRandomAccessStream.Invoke($null, @($ms))
    
    $null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
    $null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation.UniversalApiContract, ContentType = WindowsRuntime]
    
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }
    
    $opDecoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($ras)
    $tDecoder = $asTaskGeneric.MakeGenericMethod([Windows.Graphics.Imaging.BitmapDecoder]).Invoke($null, @($opDecoder))
    $tDecoder.Wait()
    $decoder = $tDecoder.Result
    
    $opBitmap = $decoder.GetSoftwareBitmapAsync()
    $tBitmap = $asTaskGeneric.MakeGenericMethod([Windows.Graphics.Imaging.SoftwareBitmap]).Invoke($null, @($opBitmap))
    $tBitmap.Wait()
    $bitmap = $tBitmap.Result
    
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    $opOcr = $engine.RecognizeAsync($bitmap)
    $tOcr = $asTaskGeneric.MakeGenericMethod([Windows.Media.Ocr.OcrResult]).Invoke($null, @($opOcr))
    $tOcr.Wait()
    $ocrResult = $tOcr.Result
    
    Write-Output "=== OCR RECOGNIZED TEXT ==="
    foreach ($line in $ocrResult.Lines) {
        Write-Output $line.Text
    }
} catch {
    Write-Output "Caught: $_"
    if ($_.Exception.InnerException) {
        Write-Output "Inner: $($_.Exception.InnerException)"
    }
}
