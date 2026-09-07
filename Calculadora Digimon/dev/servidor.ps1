<#
    Servidor local de desarrollo. No necesita instalar nada: usa el .NET que
    ya trae Windows.

    Lo que hace:
      1. Compila el proyecto (dev\compilar.ps1) y sirve dist\ en localhost.
      2. Inyecta en el HTML un script que pregunta cada segundo si hubo
         cambios. Esa misma pregunta es la que dispara la recompilación:
         si tocaste src\ o data\deck.json, vuelve a compilar y el navegador
         se recarga solo.

    No se ejecuta a mano: usa "ver-calculadora.bat" (doble clic).
#>

param([int]$Puerto = 8080)

$proyecto   = Split-Path -Parent $PSScriptRoot
$dist       = Join-Path $proyecto 'dist'
$compilador = Join-Path $PSScriptRoot 'compilar.ps1'

# Lo que se vigila para decidir si hay que recompilar.
$fuentes = @(
    (Join-Path $proyecto 'src'),
    (Join-Path $proyecto 'data\deck.json'),
    (Join-Path $proyecto 'data\cards\index.json')
)

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
    '.txt'  = 'text/plain; charset=utf-8'
}

# Recarga automática. Se inyecta al vuelo: no toca dist\ ni src\.
$recarga = @'
<script>
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

function SelloFuente {
    $ticks = 0
    foreach ($f in $fuentes) {
        if (Test-Path -LiteralPath $f -PathType Container) {
            foreach ($a in (Get-ChildItem -LiteralPath $f -Recurse -File -ErrorAction SilentlyContinue)) {
                if ($a.LastWriteTimeUtc.Ticks -gt $ticks) { $ticks = $a.LastWriteTimeUtc.Ticks }
            }
        } elseif (Test-Path -LiteralPath $f -PathType Leaf) {
            $t = (Get-Item -LiteralPath $f).LastWriteTimeUtc.Ticks
            if ($t -gt $ticks) { $ticks = $t }
        }
    }
    return $ticks
}

function SelloDist {
    $archivos = @(Get-ChildItem -LiteralPath $dist -Recurse -File -ErrorAction SilentlyContinue)
    if ($archivos.Count -eq 0) { return 'vacio' }
    $max = ($archivos | ForEach-Object { $_.LastWriteTimeUtc.Ticks } | Measure-Object -Maximum).Maximum
    return "$max-$($archivos.Count)"
}

function Compilar {
    Write-Host '  compilando...' -ForegroundColor DarkCyan
    # En un proceso aparte, para que un error de compilación no tumbe el
    # servidor ni ensucie sus variables.
    & powershell -NoProfile -ExecutionPolicy Bypass -File $compilador
    if ($LASTEXITCODE -ne 0) {
        Write-Host '  La compilación falló. Se sigue sirviendo lo anterior.' -ForegroundColor Red
        Write-Host '  Corrige el error y guarda otra vez.' -ForegroundColor Yellow
    }
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

# ---------- primera compilación ----------
Write-Host ''
Write-Host '  Calculadora Digimon - servidor de desarrollo' -ForegroundColor Cyan
Write-Host '  --------------------------------------------'
Compilar
$ultimoSelloFuente = SelloFuente

if (-not (Test-Path -LiteralPath (Join-Path $dist 'index.html'))) {
    Write-Host ''
    Write-Host '  No se pudo generar dist\index.html.' -ForegroundColor Red
    Read-Host '  Enter para cerrar'
    exit 1
}

# ---------- abrir el puerto ----------
$escucha = $null
for ($p = $Puerto; $p -lt ($Puerto + 10); $p++) {
    try {
        $escucha = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
        $escucha.Start()
        $Puerto = $p
        break
    } catch { $escucha = $null }
}

if ($null -eq $escucha) {
    Write-Host '  No se pudo abrir ningun puerto libre.' -ForegroundColor Red
    Read-Host '  Enter para cerrar'
    exit 1
}

$url = "http://localhost:$Puerto/"
Write-Host ''
Write-Host "  Direccion: $url" -ForegroundColor Yellow
Write-Host ''
Write-Host '  Guarda cualquier archivo de src\ y se recompila y recarga solo.'
Write-Host '  Para detener el servidor: Ctrl+C o cierra esta ventana.'
Write-Host ''

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

            # El sondeo del navegador es lo que dispara la recompilación: así
            # no hacen falta hilos ni FileSystemWatcher.
            if ($ruta -eq '/__cambios') {
                $sello = SelloFuente
                if ($sello -ne $ultimoSelloFuente) {
                    $ultimoSelloFuente = $sello
                    Compilar
                }
                Enviar $flujo '200 OK' 'text/plain' ([Text.Encoding]::ASCII.GetBytes((SelloDist)))
                continue
            }

            if ($ruta -eq '/') { $ruta = '/index.html' }

            if ($ruta -like '*..*') {
                Enviar $flujo '403 Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('403'))
                continue
            }

            $relativa = $ruta.TrimStart('/') -replace '/', '\'
            $completa = Join-Path $dist $relativa

            if (-not (Test-Path -LiteralPath $completa -PathType Leaf)) {
                Write-Host "  404  $ruta" -ForegroundColor DarkGray
                Enviar $flujo '404 Not Found' 'text/html; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes("<h1>404</h1><p>No existe: $ruta</p>"))
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
    Write-Host ''
    Write-Host '  Servidor detenido.' -ForegroundColor Cyan
}
