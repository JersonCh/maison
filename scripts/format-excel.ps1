$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $filePath = Resolve-Path "public\plantillas\plantilla_productos_maison.xlsx"
    Write-Host "Formatting: $filePath"
    $wb = $excel.Workbooks.Open($filePath)
    
    # 1. Hoja Productos (A1:P1 con 16 columnas en negrita)
    $ws1 = $wb.Sheets.Item(1)
    $headerRange1 = $ws1.Range("A1:P1")
    $headerRange1.Font.Bold = $true
    $headerRange1.Font.Size = 11
    $headerRange1.Interior.Color = 0xF5F0E6 # Ivory Maison
    $headerRange1.Font.Color = 0x1A1A1A
    $ws1.Columns.AutoFit() | Out-Null
    
    # 2. Hoja Guia_y_Valores
    $ws2 = $wb.Sheets.Item(2)
    $headerRange2 = $ws2.Range("A1:D1")
    $headerRange2.Font.Bold = $true
    $headerRange2.Font.Size = 11
    $headerRange2.Interior.Color = 0xF5F0E6
    
    # Notas importantes en negrita también
    $ws2.Range("A19:A19").Font.Bold = $true
    $ws2.Range("A22:A22").Font.Bold = $true
    
    $ws2.Columns.AutoFit() | Out-Null

    $wb.Save()
    $wb.Close()
    Write-Host "SUCCESS: Bold headers and formatting applied!"
}
catch {
    Write-Error $_
}
finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
