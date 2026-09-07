<#
.SYNOPSIS
  Descarga el catalogo completo de cartas del Digimon Card Game (datos + imagenes).

.DESCRIPTION
  Datos:    API publica de digimoncard.io (sin clave).
  Imagenes: images.digimoncard.io, una por ID de carta.

  Escribe en data/cards/:
    cards.json        catalogo completo, una entrada por ID (todos los campos)
    index.json        indice ligero para buscar (id, nombre, nivel, color, coste, DP...)
    meta.json         fecha de descarga, origen y totales
    images/<ID>.<ext> imagen de cada carta
    images-failed.txt IDs cuya imagen no se pudo bajar (solo si hubo fallos)

  El servidor sirve todas las imagenes bajo la extension .jpg pero mezcla JPEG,
  PNG y WebP, asi que despues de bajarlas se renombran segun su formato real y
  el nombre resultante es el que queda escrito en 'image_file'.

  Es reanudable: las imagenes ya presentes no se vuelven a pedir.

.PARAMETER SkipImages
  Actualiza solo los JSON, sin tocar las imagenes.

.PARAMETER OnlyImages
  Reusa el cards.json existente y baja unicamente las imagenes que falten.

.PARAMETER Force
  Vuelve a bajar todas las imagenes, incluidas las que ya existen.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\fetch-cards.ps1
#>
[CmdletBinding()]
param(
  [switch]$SkipImages,
  [switch]$OnlyImages,
  [switch]$Force,
  [int]$Parallel = 8
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root     = Split-Path -Parent $PSScriptRoot
$outDir   = Join-Path $root 'data\cards'
$imgDir   = Join-Path $outDir 'images'
$cardsOut = Join-Path $outDir 'cards.json'
$indexOut = Join-Path $outDir 'index.json'
$metaOut  = Join-Path $outDir 'meta.json'
$failLog  = Join-Path $outDir 'images-failed.txt'

$apiUrl    = 'https://digimoncard.io/api-public/search.php?sort=name&series=Digimon%20Card%20Game'
$imgUrlFmt = 'https://images.digimoncard.io/images/cards/{0}.jpg'
$exts      = @('.jpg', '.png', '.webp')

New-Item -ItemType Directory -Force -Path $imgDir | Out-Null

function Write-Utf8Json([string]$path, $object, [int]$depth = 12) {
  $json = $object | ConvertTo-Json -Depth $depth
  [IO.File]::WriteAllText($path, $json, (New-Object Text.UTF8Encoding($false)))
}

function Read-Utf8Json([string]$path) {
  Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json
}

# Extension real segun los primeros bytes, no segun como se llame el archivo.
function Get-RealExtension([string]$path) {
  $buf = New-Object byte[] 12
  $fs  = [IO.File]::OpenRead($path)
  try { $n = $fs.Read($buf, 0, 12) } finally { $fs.Close() }
  if ($n -lt 12) { return $null }
  if ($buf[0] -eq 0xFF -and $buf[1] -eq 0xD8) { return '.jpg' }
  if ($buf[0] -eq 0x89 -and $buf[1] -eq 0x50) { return '.png' }
  if ($buf[0] -eq 0x52 -and $buf[1] -eq 0x49 -and $buf[8] -eq 0x57) { return '.webp' }
  return $null
}

# Nombre real en disco de la imagen de una carta, o $null si no esta.
function Find-Image([string]$id) {
  foreach ($e in $exts) {
    $p = Join-Path $imgDir ($id + $e)
    if ((Test-Path -LiteralPath $p) -and ((Get-Item -LiteralPath $p).Length -gt 0)) { return ($id + $e) }
  }
  return $null
}

# --- 1. Catalogo -------------------------------------------------------------

if ($OnlyImages) {
  if (-not (Test-Path $cardsOut)) { throw "No existe $cardsOut. Ejecuta el script sin -OnlyImages primero." }
  Write-Host "Reusando catalogo existente: $cardsOut"
  # ConvertFrom-Json de PowerShell 5.1 emite el array entero como un solo
  # objeto: hay que asignarlo antes de envolverlo con @().
  $cards = Read-Utf8Json $cardsOut
  $cards = @($cards)
} else {
  Write-Host "Descargando catalogo desde digimoncard.io ..."
  $raw = Join-Path $env:TEMP ("digimon-api-{0}.json" -f (Get-Date -Format 'yyyyMMddHHmmss'))
  & curl.exe -sSL --fail --retry 3 --retry-delay 2 -m 300 -o $raw $apiUrl
  if ($LASTEXITCODE -ne 0) { throw "curl fallo al descargar la API (codigo $LASTEXITCODE)." }

  $all = Read-Utf8Json $raw
  Remove-Item $raw -Force -ErrorAction SilentlyContinue
  Write-Host ("  {0} registros recibidos" -f $all.Count)

  # La API repite una fila por cada edicion / tcgplayer_id de la misma carta.
  # Nos quedamos con una entrada por ID y juntamos las ediciones en 'printings'.
  $list = New-Object System.Collections.ArrayList
  foreach ($grp in ($all | Group-Object id)) {
    $c = $grp.Group[0]
    $printings = @($grp.Group | ForEach-Object { $_.set_name } | Where-Object { $_ } | Sort-Object -Unique)
    $c | Add-Member -NotePropertyName printings -NotePropertyValue $printings -Force
    [void]$list.Add($c)
  }
  $cards = @($list | Sort-Object id)
  Write-Host ("  {0} cartas unicas" -f $cards.Count)
}

# --- 2. Imagenes -------------------------------------------------------------

$downloaded = 0
$failed     = @()

if (-not $SkipImages) {
  $pending = New-Object System.Collections.ArrayList
  foreach ($c in $cards) {
    $id = $c.id
    if ($id -match '[\\/:*?"<>|]') { Write-Warning "ID no valido como nombre de archivo: $id"; continue }
    if (-not $Force -and (Find-Image $id)) { continue }
    [void]$pending.Add([pscustomobject]@{
      id   = $id
      url  = ($imgUrlFmt -f $id)
      dest = (Join-Path $imgDir "$id.jpg")   # extension provisional; se corrige abajo
    })
  }

  if ($pending.Count -eq 0) {
    Write-Host "Todas las imagenes ya estaban descargadas."
  } else {
    Write-Host ("Descargando {0} imagenes ({1} en paralelo) ..." -f $pending.Count, $Parallel)

    # curl acepta un fichero de configuracion con todas las descargas y las
    # resuelve en paralelo: mucho mas rapido que una peticion por carta.
    $cfg = Join-Path $env:TEMP ("digimon-imgs-{0}.txt" -f (Get-Date -Format 'yyyyMMddHHmmss'))
    $sb  = New-Object Text.StringBuilder
    foreach ($p in $pending) {
      [void]$sb.AppendLine('url = "'    + $p.url + '"')
      [void]$sb.AppendLine('output = "' + ($p.dest -replace '\\', '/') + '"')
    }
    [IO.File]::WriteAllText($cfg, $sb.ToString(), (New-Object Text.UTF8Encoding($false)))

    & curl.exe -sS -L --fail --retry 2 --retry-delay 1 -m 60 --parallel --parallel-max $Parallel --user-agent 'calculadora-digimon/1.0' -K $cfg
    Remove-Item $cfg -Force -ErrorAction SilentlyContinue

    foreach ($p in $pending) {
      if ((Test-Path -LiteralPath $p.dest) -and ((Get-Item -LiteralPath $p.dest).Length -gt 0)) {
        $downloaded++
      } else {
        Remove-Item -LiteralPath $p.dest -Force -ErrorAction SilentlyContinue   # sin ficheros de 0 bytes
        $failed += $p.id
      }
    }

    if ($failed.Count -gt 0) {
      [IO.File]::WriteAllLines($failLog, [string[]]$failed)
      Write-Warning ("{0} imagenes fallaron. Lista en {1}. Relanza el script para reintentarlas." -f $failed.Count, $failLog)
    } elseif (Test-Path $failLog) {
      Remove-Item $failLog -Force
    }
  }

  # Renombrado al formato real. Barre todo el directorio, asi que tambien
  # arregla lo que quedo de ejecuciones anteriores.
  $renamed = 0
  foreach ($f in [IO.Directory]::EnumerateFiles($imgDir)) {
    $real = Get-RealExtension $f
    if (-not $real) { continue }
    $cur = [IO.Path]::GetExtension($f)
    if ($cur -ieq $real) { continue }
    $target = [IO.Path]::ChangeExtension($f, $real)
    if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Force }
    Move-Item -LiteralPath $f -Destination $target -Force
    $renamed++
  }
  if ($renamed) { Write-Host ("Renombradas {0} imagenes a su formato real (png/webp/jpg)." -f $renamed) }
}

# --- 3. JSON de salida -------------------------------------------------------

$noImage = 0
foreach ($c in $cards) {
  $file = Find-Image $c.id
  if (-not $file) { $noImage++ }
  $c | Add-Member -NotePropertyName image      -NotePropertyValue ($imgUrlFmt -f $c.id) -Force
  $c | Add-Member -NotePropertyName image_file -NotePropertyValue $(if ($file) { "images/$file" } else { $null }) -Force
}

Write-Host "Escribiendo cards.json ..."
Write-Utf8Json $cardsOut $cards

# Indice ligero: lo justo para buscar y enlazar, sin los textos de efectos.
Write-Host "Escribiendo index.json ..."
$index = foreach ($c in $cards) {
  [pscustomobject][ordered]@{
    id     = $c.id
    name   = $c.name
    type   = $c.type
    level  = $c.level
    cost   = $c.play_cost
    evo    = $c.evolution_cost
    dp     = $c.dp
    color  = $c.color
    color2 = $c.color2
    attr   = $c.attribute
    traits = (@($c.digi_type, $c.digi_type2, $c.digi_type3, $c.digi_type4, $c.digi_type5 |
                Where-Object { $_ }) -join ' / ')
    rarity = $c.rarity
    set    = $c.set_name
    img    = $c.image_file
    url    = $c.image
    # clave de busqueda ya normalizada: minusculas, sin puntuacion
    k      = ((($c.name + ' ' + $c.id).ToLowerInvariant() -replace '[^a-z0-9 ]', ' ') -replace '\s+', ' ').Trim()
  }
}
Write-Utf8Json $indexOut @($index)

# --- 4. Resumen --------------------------------------------------------------

$imgFiles = @(Get-ChildItem -LiteralPath $imgDir -File -ErrorAction SilentlyContinue)
$bytes    = ($imgFiles | Measure-Object Length -Sum).Sum
if (-not $bytes) { $bytes = 0 }

Write-Utf8Json $metaOut ([ordered]@{
  fetched_at   = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
  source_data  = $apiUrl
  source_image = ($imgUrlFmt -f '<ID>')
  cards        = $cards.Count
  images       = $imgFiles.Count
  images_mb    = [math]::Round($bytes / 1MB, 1)
  formats      = ($imgFiles | Group-Object Extension | Sort-Object Count -Descending |
                  ForEach-Object { "$($_.Name.TrimStart('.')): $($_.Count)" }) -join ', '
  note         = 'Datos y arte propiedad de Bandai. Archivo local para uso personal.'
})

Write-Host ""
Write-Host ("Listo. {0} cartas, {1} imagenes ({2} MB) en {3}" -f $cards.Count, $imgFiles.Count, [math]::Round($bytes / 1MB, 1), $outDir)
if ($downloaded)   { Write-Host ("  nuevas en esta ejecucion: {0}" -f $downloaded) }
if ($failed.Count) { Write-Host ("  pendientes de reintentar: {0}" -f $failed.Count) }
if ($noImage)      { Write-Host ("  cartas sin imagen local: {0}" -f $noImage) }
