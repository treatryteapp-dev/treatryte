const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Let's use PowerShell via child_process
const { execSync } = require('child_process');

try {
  const docxPath = 'C:\\Users\\DELL\\Downloads\\Telegram Desktop\\TreatRyte Security Architecture.docx';
  const outPath = 'C:\\Users\\DELL\\Desktop\\TREATRYTE FULL\\security_doc.txt';
  
  // Use powershell to extract text
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead("${docxPath}")
    $entry = $zip.GetEntry("word/document.xml")
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()
    $xml = $xml -replace '<[^>]+>', ' '
    Set-Content -Path "${outPath}" -Value $xml
  `;
  
  fs.writeFileSync('extract.ps1', psScript);
  execSync('powershell -ExecutionPolicy Bypass -File extract.ps1');
  console.log("Extraction complete.");
} catch(e) {
  console.error(e);
}
