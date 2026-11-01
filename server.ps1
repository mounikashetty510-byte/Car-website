param(
    [int]$Port = 5500
)

$ip = [System.Net.IPAddress]::Loopback
$listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
try {
    $listener.Start()
} catch {
    # If 5500 is busy, try 5501, 8080, etc.
    $Port = 8080
    $listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
    $listener.Start()
}

$url = "http://localhost:$Port/"
Write-Host "=================================================="
Write-Host "  NOCTIS Local Server Running"
Write-Host "  URL: $url"
Write-Host "=================================================="

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json"
    ".webp" = "image/webp"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $stream.ReadTimeout = 3000
        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -gt 0) {
            $reqText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
            $firstLine = $reqText.Split("`n")[0].Trim()
            $tokens = $firstLine.Split(" ")
            $method = $tokens[0].ToUpper()
            if ($tokens.Length -ge 2 -and ($method -eq "GET" -or $method -eq "HEAD")) {
                $rawPath = $tokens[1].Split("?")[0].TrimStart("/")
                if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = "index.html" }
                $rawPath = [System.Uri]::UnescapeDataString($rawPath).Replace("/", "\")
                $filePath = Join-Path $workspace $rawPath

                if (Test-Path $filePath -PathType Leaf) {
                    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $ct = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                    
                    $headers = "HTTP/1.1 200 OK`r`n" +
                               "Content-Type: $ct`r`n" +
                               "Content-Length: $($fileBytes.Length)`r`n" +
                               "Access-Control-Allow-Origin: *`r`n" +
                               "Cache-Control: no-cache`r`n" +
                               "Connection: close`r`n`r`n"
                    $hdrBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
                    $stream.Write($hdrBytes, 0, $hdrBytes.Length)
                    if ($method -eq "GET") {
                        $stream.Write($fileBytes, 0, $fileBytes.Length)
                    }
                } else {
                    $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                    $nfBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
                    $stream.Write($nfBytes, 0, $nfBytes.Length)
                }
            }
        }
    } catch {
        # ignore client disconnects
    } finally {
        $client.Close()
    }
}
