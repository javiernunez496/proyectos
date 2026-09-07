<#
    Versión en PowerShell de build.mjs, para máquinas sin Node.

    Hace exactamente lo mismo: une src/ + data/ y escribe dist/artifact.html
    y dist/index.html, byte a byte igual que el original.
    No instala ni necesita nada: solo el .NET que ya trae Windows.

    IMPORTANTE: si cambias build.mjs, cambia también este archivo. Son dos
    compiladores que tienen que producir lo mismo.

    Uso:  powershell -ExecutionPolicy Bypass -File dev\compilar.ps1
    (o solo, cada vez que guardas, con ver-calculadora.bat)
#>

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$utf8SinBom = New-Object System.Text.UTF8Encoding($false)

$COMILLA   = [char]0x22
$CONTRABAR = [char]0x5C
$MENOR_ESCAPADO = [string]$CONTRABAR + 'u003c'   # el "<" del JSON incrustado en un <script>

function Leer([string]$relativa) {
    return [IO.File]::ReadAllText((Join-Path $raiz $relativa), [Text.Encoding]::UTF8)
}

# Escapa un texto para que quepa dentro de una cadena JSON.
# "<" va escapado porque el JSON viaja dentro de un <script>.
function EscaparJson([string]$s) {
    if ($null -eq $s) { return '' }
    $r = $s.Replace([string]$CONTRABAR, [string]$CONTRABAR + $CONTRABAR)
    $r = $r.Replace([string]$COMILLA, [string]$CONTRABAR + $COMILLA)
    $r = $r.Replace('<', $MENOR_ESCAPADO)
    return $r.Replace("`r", '\r').Replace("`n", '\n').Replace("`t", '\t')
}

# Quita los espacios y saltos de línea que están fuera de las cadenas, igual
# que hace JSON.stringify sobre un JSON ya parseado.
function MinificarJson([string]$s) {
    $sb = New-Object System.Text.StringBuilder $s.Length
    $enCadena = $false
    $escape = $false
    foreach ($ch in $s.ToCharArray()) {
        if ($enCadena) {
            [void]$sb.Append($ch)
            if ($escape) { $escape = $false }
            elseif ($ch -eq $CONTRABAR) { $escape = $true }
            elseif ($ch -eq $COMILLA) { $enCadena = $false }
        } elseif ($ch -eq $COMILLA) {
            $enCadena = $true
            [void]$sb.Append($ch)
        } elseif ($ch -ne ' ' -and $ch -ne "`t" -and $ch -ne "`r" -and $ch -ne "`n") {
            [void]$sb.Append($ch)
        }
    }
    return $sb.ToString()
}

$template = Leer 'src\template.html'
$styles   = Leer 'src\styles.css'
$app      = Leer 'src\app.js'

# ---------- mazo ----------
# Se minifica el texto original en vez de volver a serializarlo con
# ConvertTo-Json: así sale igual que build.mjs y no hay riesgo de que
# PowerShell altere el JSON al convertirlo de ida y vuelta (el caso clásico:
# una lista de un solo elemento se convierte en un valor suelto).
$deckTexto = Leer 'data\deck.json'
$deckObj   = $deckTexto | ConvertFrom-Json
$deckSafe  = (MinificarJson $deckTexto).Replace('<', $MENOR_ESCAPADO)

# ---------- ilustraciones ----------
# Van incrustadas en base64 para que dist/index.html siga siendo un archivo
# suelto que funciona sin conexión. Solo las cartas del mazo: las 4412 del
# catálogo pesan 463 MB. El servidor las sirve todas como .jpg pero mezcla
# formatos, así que aquí manda la extensión que dejó fetch-cards.ps1.
$mime = [ordered]@{ '.jpg' = 'image/jpeg'; '.png' = 'image/png'; '.webp' = 'image/webp' }

$sbImg = New-Object System.Text.StringBuilder
[void]$sbImg.Append('{')
$nImg = 0
$faltan = @()

# Las 50 y el mazo de huevos: los Digi-Egg también se ven en la lista.
$aIlustrar = @($deckObj.cards)
if ($deckObj.eggs) { $aIlustrar += @($deckObj.eggs) }

foreach ($c in $aIlustrar) {
    if (-not $c.id) { continue }
    $uri = $null
    foreach ($ext in $mime.Keys) {
        $archivo = Join-Path $raiz ('data\cards\images\' + $c.id + $ext)
        if (Test-Path -LiteralPath $archivo -PathType Leaf) {
            $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($archivo))
            $uri = 'data:' + $mime[$ext] + ';base64,' + $b64
            break
        }
    }
    if ($uri) {
        if ($nImg -gt 0) { [void]$sbImg.Append(',') }
        [void]$sbImg.Append($COMILLA).Append($c.id).Append($COMILLA).Append(':')
        [void]$sbImg.Append($COMILLA).Append($uri).Append($COMILLA)
        $nImg++
    } else {
        $faltan += $c.id
    }
}
[void]$sbImg.Append('}')
$imagesJson = $sbImg.ToString()

if ($nImg -gt 0) {
    $kbImg = '{0:N1}' -f ([Text.Encoding]::UTF8.GetByteCount($imagesJson) / 1024)
    Write-Host ('  ilustraciones       {0} cartas, {1} KB' -f $nImg, $kbImg)
}
if ($faltan.Count -gt 0) {
    Write-Host ('  Sin ilustración local: {0}' -f ($faltan -join ', ')) -ForegroundColor Yellow
    Write-Host '  Ejecuta tools\fetch-cards.ps1 para descargarlas.' -ForegroundColor Yellow
}

# ---------- catálogo del importador ----------
# Con él, pegar "4 Jupitermon BT24-101" basta para saber que es un Lv.6 de
# coste 12 y 13000 DP. Va comprimido a [id, nombre, grupo, coste, DP] porque
# son 4412 cartas y viajan dentro del HTML.
# Estos índices los lee src/app.js tal cual: si cambian aquí, cambian allí.
$HUEVO          = 7   # Lv.2, va al mazo de huevos
$FUERA_DEL_MAZO = 8   # ni en las 50 ni en los huevos
$carddbSafe = '[]'
try {
    $index = (Leer 'data\cards\index.json') | ConvertFrom-Json
    $sbDb = New-Object System.Text.StringBuilder
    [void]$sbDb.Append('[')
    $primero = $true
    foreach ($c in $index) {
        $g = $FUERA_DEL_MAZO
        if ($c.type -eq 'Tamer') { $g = 5 }
        elseif ($c.type -eq 'Option') { $g = 6 }
        elseif ($c.type -eq 'Digi-Egg' -or $c.level -eq 2) { $g = $HUEVO }
        elseif ($null -ne $c.level -and $c.level -ge 3 -and $c.level -le 7) { $g = $c.level - 3 }

        $coste = if ($c.cost) { $c.cost } else { 0 }
        $dp    = if ($c.dp)   { $c.dp }   else { 0 }

        if (-not $primero) { [void]$sbDb.Append(',') }
        $primero = $false
        [void]$sbDb.Append('[').Append($COMILLA).Append((EscaparJson $c.id)).Append($COMILLA)
        [void]$sbDb.Append(',').Append($COMILLA).Append((EscaparJson $c.name)).Append($COMILLA)
        [void]$sbDb.Append(',').Append($g).Append(',').Append($coste).Append(',').Append($dp).Append(']')
    }
    [void]$sbDb.Append(']')
    $carddbSafe = $sbDb.ToString()
    Write-Host ('  catálogo            {0} cartas' -f $index.Count)
} catch {
    # El catálogo se descarga aparte y no está versionado entero. Sin él la
    # página funciona igual, solo que el importador no sabe resolver IDs.
    Write-Host '  Sin data\cards\index.json: el importador quedará sin catálogo.' -ForegroundColor Yellow
    Write-Host '  Ejecuta tools\fetch-cards.ps1 para generarlo.' -ForegroundColor Yellow
}

# ---------- armar los dos archivos ----------
$contenido = $template.
    Replace('<!--{{DECK}}-->',   $deckSafe).
    Replace('<!--{{CARDS}}-->',  $carddbSafe).
    Replace('<!--{{IMAGES}}-->', $imagesJson).
    Replace('<!--{{STYLES}}-->', $styles.TrimEnd()).
    Replace('<!--{{APP}}-->',    $app.TrimEnd())

$dist = Join-Path $raiz 'dist'
if (-not (Test-Path -LiteralPath $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

# 1. artifact.html — solo el contenido. Claude le pone <!doctype>, <head> y
#    <body> al publicarlo, así que este archivo no debe traerlos.
[IO.File]::WriteAllText((Join-Path $dist 'artifact.html'), $contenido, $utf8SinBom)

# 2. index.html — documento completo, se abre con doble clic en el navegador.
$suelto = @"
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{color-scheme:light dark}
  body{margin:0; font:14px system-ui, -apple-system, "Segoe UI", sans-serif}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
$contenido
</body>
</html>
"@
$suelto = $suelto.Replace("`r`n", "`n") + "`n"

[IO.File]::WriteAllText((Join-Path $dist 'index.html'), $suelto, $utf8SinBom)

function EnKb([string]$s) { return '{0:N1} KB' -f ([Text.Encoding]::UTF8.GetByteCount($s) / 1024) }
Write-Host ('  dist\index.html     {0}  (documento completo)' -f (EnKb $suelto))
Write-Host ('  dist\artifact.html  {0}  (para publicar en Claude)' -f (EnKb $contenido))
