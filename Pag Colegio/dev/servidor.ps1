<#
    Servidor local para ver la pagina mientras se edita.
    No necesita instalar nada: usa el .NET que ya trae Windows.

    Lo que hace:
      1. Sirve los archivos de la carpeta "Pag Colegio" en http://localhost:8080
      2. Inyecta un pequeño script en el HTML que revisa cada segundo si
         cambio algun archivo; si cambio, recarga la pagina sola.

    No se ejecuta a mano: usa "ver-pagina.bat" (doble clic).
#>

param([int]$Puerto = 8080)

$raiz = Split-Path -Parent $PSScriptRoot

# ---------- tipos de archivo ----------
$tipos = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.txt'  = 'text/plain; charset=utf-8'
    '.pdf'  = 'application/pdf'
}

# ---------- script de recarga automatica ----------
$recarga = @'
<script>
/* Solo existe en desarrollo: lo inyecta dev/servidor.ps1, no esta en index.html */
(function () {
  var ultima = null;
  setInterval(function () {
    fetch('/__cambios', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        if (ultima === null) { ultima = t; }
        else if (t !== ultima) { location.reload(); }
      })
      .catch(function () { /* servidor apagado: no molestar */ });
  }, 1000);
})();
</script>
'@

# ---------- utilidades ----------
function Sello-DeCambios {
    $archivos = Get-ChildItem -Path $raiz -Recurse -File -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName -notlike '*\.git\*' }
    $max = ($archivos | ForEach-Object { $_.LastWriteTimeUtc.Ticks } | Measure-Object -Maximum).Maximum
    return "$max-$($archivos.Count)"
}

function Enviar($flujo, [string]$estado, [string]$tipo, [byte[]]$cuerpo) {
    $cabecera = "HTTP/1.1 $estado`r`n" +
                "Content-Type: $tipo`r`n" +
                "Content-Length: $($cuerpo.Length)`r`n" +
                "Cache-Control: no-store`r`n" +
                "Connection: close`r`n`r`n"
    $bytes = [Text.Encoding]::ASCII.GetBytes($cabecera)
    $flujo.Write($bytes, 0, $bytes.Length)
    if ($cuerpo.Length -gt 0) { $flujo.Write($cuerpo, 0, $cuerpo.Length) }
    $flujo.Flush()
}

# ---------- levantar el servidor (probando puertos libres) ----------
$escucha = $null
for ($p = $Puerto; $p -lt ($Puerto + 10); $p++) {
    try {
        $escucha = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
        $escucha.Start()
        $Puerto = $p
        break
    } catch {
        $escucha = $null
    }
}

if ($null -eq $escucha) {
    Write-Host "No se pudo abrir ningun puerto entre $Puerto y $($Puerto + 9)." -ForegroundColor Red
    Read-Host "Enter para cerrar"
    exit 1
}

$url = "http://localhost:$Puerto/"

Write-Host ""
Write-Host "  Colegio Diferencial Mostazal - servidor de desarrollo" -ForegroundColor Cyan
Write-Host "  ----------------------------------------------------"
Write-Host "  Carpeta : $raiz"
Write-Host "  Direccion: $url" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Guarda un archivo y el navegador se recarga solo."
Write-Host "  Para detener el servidor: Ctrl+C o cierra esta ventana."
Write-Host ""

Start-Process $url

# ---------- bucle principal ----------
try {
    while ($true) {
        $cliente = $escucha.AcceptTcpClient()
        $flujo = $cliente.GetStream()
        try {
            $buffer = New-Object byte[] 8192
            $leidos = $flujo.Read($buffer, 0, $buffer.Length)
            if ($leidos -le 0) { continue }

            $peticion = [Text.Encoding]::ASCII.GetString($buffer, 0, $leidos)
            $primera  = ($peticion -split "`r`n")[0]
            $ruta     = ($primera -split ' ')[1]
            if (-not $ruta) { continue }

            $ruta = ($ruta -split '\?')[0]
            $ruta = [System.Uri]::UnescapeDataString($ruta)

            # endpoint interno de la recarga automatica
            if ($ruta -eq '/__cambios') {
                Enviar $flujo '200 OK' 'text/plain' ([Text.Encoding]::ASCII.GetBytes((Sello-DeCambios)))
                continue
            }

            if ($ruta -eq '/') { $ruta = '/index.html' }

            # nada de salirse de la carpeta del proyecto
            if ($ruta -like '*..*') {
                Enviar $flujo '403 Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('403'))
                continue
            }

            $relativa = $ruta.TrimStart('/') -replace '/', '\'
            $completa = Join-Path $raiz $relativa

            if (-not (Test-Path -LiteralPath $completa -PathType Leaf)) {
                Write-Host "  404  $ruta" -ForegroundColor DarkGray
                $cuerpo = [Text.Encoding]::UTF8.GetBytes("<h1>404</h1><p>No existe: $ruta</p>")
                Enviar $flujo '404 Not Found' 'text/html; charset=utf-8' $cuerpo
                continue
            }

            $extension = [IO.Path]::GetExtension($completa).ToLower()
            $tipo = $tipos[$extension]
            if (-not $tipo) { $tipo = 'application/octet-stream' }

            if ($extension -eq '.html') {
                $texto = [IO.File]::ReadAllText($completa, [Text.Encoding]::UTF8)
                if ($texto -match '</body>') {
                    $texto = $texto -replace '</body>', ($recarga + "`r`n</body>")
                } else {
                    $texto = $texto + $recarga
                }
                $cuerpo = [Text.Encoding]::UTF8.GetBytes($texto)
            } else {
                $cuerpo = [IO.File]::ReadAllBytes($completa)
            }

            Write-Host "  200  $ruta" -ForegroundColor DarkGreen
            Enviar $flujo '200 OK' $tipo $cuerpo
        } catch {
            # una peticion rota no debe tumbar el servidor
        } finally {
            $flujo.Close()
            $cliente.Close()
        }
    }
} finally {
    $escucha.Stop()
    Write-Host ""
    Write-Host "  Servidor detenido." -ForegroundColor Cyan
}
