
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead("C:\Users\DELL\Downloads\Telegram Desktop\TreatRyte Security Architecture.docx")
    $entry = $zip.GetEntry("word/document.xml")
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()
    $xml = $xml -replace '<[^>]+>', ' '
    Set-Content -Path "C:\Users\DELL\Desktop\TREATRYTE FULL\security_doc.txt" -Value $xml
  