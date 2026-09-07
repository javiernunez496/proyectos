<#
.SYNOPSIS
  Busca cartas en el catalogo descargado (data/cards/index.json).

.DESCRIPTION
  Filtra por texto libre y por cualquier combinacion de campos. El texto libre
  busca en nombre e ID; con -All busca tambien en rasgos, color y set.

.PARAMETER Query
  Texto a buscar. Varias palabras: deben aparecer todas.

.PARAMETER Level
  Nivel del Digimon (3-7).

.PARAMETER Color
  Color, parcial: "yell", "Purple"... Vale tanto el principal como el segundo.

.PARAMETER Type
  Digimon, Tamer, Option, Digi-Egg, Dual.

.PARAMETER Trait
  Rasgo, parcial: "Olympos", "TS", "Holy Beast".

.PARAMETER Cost
  Coste de juego exacto.

.PARAMETER Dp
  DP exacto.

.PARAMETER Set
  Expansion de origen, por codigo: "BT24", "BT-24", "EX-09", "ST1", "P".
  Son las cartas numeradas de ese set, sin reimpresiones de otros.

.PARAMETER Product
  Producto donde aparece la carta, parcial: "TIME STRANGER", "Starter Deck".
  Aqui si entran las reimpresiones: una carta sale en todos sus productos.

.PARAMETER All
  Amplia la busqueda de texto a rasgos, color y set.

.PARAMETER Full
  Muestra tambien los textos de efecto (lee cards.json, mas lento).

.PARAMETER Open
  Abre la imagen local de cada resultado con el visor por defecto.

.PARAMETER Take
  Maximo de resultados. 0 = todos. Por defecto 30.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\find-card.ps1 jupitermon

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\find-card.ps1 -Trait "Olympos XII" -Level 6

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\find-card.ps1 BT24-101 -Full -Open
#>
[CmdletBinding(PositionalBinding = $false)]
param(
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)][string[]]$Query,
  [int]$Level,
  [string]$Color,
  [string]$Type,
  [string]$Trait,
  [int]$Cost = -1,
  [int]$Dp = -1,
  [string]$Set,
  [string]$Product,
  [switch]$All,
  [switch]$Full,
  [switch]$Open,
  [int]$Take = 30
)

$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot
$cardsDir  = Join-Path $root 'data\cards'
$indexPath = Join-Path $cardsDir 'index.json'
if (-not (Test-Path $indexPath)) { throw "Falta $indexPath. Ejecuta antes tools\fetch-cards.ps1." }

$index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
$res   = $index

if ($Query) {
  foreach ($word in ($Query -join ' ' -split '\s+' | Where-Object { $_ })) {
    $w = (($word.ToLowerInvariant() -replace '[^a-z0-9]', ' ') -replace '\s+', ' ').Trim()
    if (-not $w) { continue }
    $res = @($res | Where-Object {
      $hay = $_.k
      if ($All) { $hay = ($hay + ' ' + $_.traits + ' ' + $_.color + ' ' + ($_.set -join ' ')).ToLowerInvariant() }
      $hay -like "*$w*"
    })
  }
}

if ($PSBoundParameters.ContainsKey('Level')) { $res = @($res | Where-Object { $_.level -eq $Level }) }
if ($Cost -ge 0) { $res = @($res | Where-Object { $_.cost -eq $Cost }) }
if ($Dp   -ge 0) { $res = @($res | Where-Object { $_.dp   -eq $Dp }) }
if ($Type)  { $res = @($res | Where-Object { $_.type   -like "*$Type*" }) }
if ($Trait) { $res = @($res | Where-Object { $_.traits -like "*$Trait*" }) }
if ($Color) { $res = @($res | Where-Object { $_.color -like "*$Color*" -or $_.color2 -like "*$Color*" }) }
if ($Set) {
  # Expansion de origen: el prefijo del ID. "BT-24" y "BT24" son lo mismo, y
  # "EX-09" es el prefijo "EX9", asi que hay que quitar el cero de relleno.
  if ($Set -notmatch '^([A-Za-z]+)-?0*(\d*)$') {
    throw "-Set espera un codigo de expansion (BT24, EX-09, ST1, P). Para buscar por nombre de producto usa -Product."
  }
  $code = ($Matches[1] + $Matches[2]).ToUpperInvariant()
  $res  = @($res | Where-Object { (($_.id -split '-')[0]).ToUpperInvariant() -eq $code })
}
if ($Product) { $res = @($res | Where-Object { ($_.set -join ' ') -like "*$Product*" }) }

$total = $res.Count
if ($Take -gt 0) { $res = @($res | Select-Object -First $Take) }

if ($total -eq 0) { Write-Host "Sin resultados."; return }

if ($Full) {
  $cards = Get-Content -LiteralPath (Join-Path $cardsDir 'cards.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $byId  = @{}; foreach ($c in $cards) { $byId[$c.id] = $c }
  foreach ($r in $res) {
    $c = $byId[$r.id]
    Write-Host ""
    Write-Host ("{0}  {1}" -f $c.id, $c.name) -ForegroundColor Cyan
    Write-Host ("  {0} | Lv.{1} | coste {2} | evo {3} | DP {4} | {5} | {6} | {7}" -f `
      $c.type, $c.level, $c.play_cost, $c.evolution_cost, $c.dp, $c.color, $c.attribute, $r.traits)
    Write-Host ("  {0}  [{1}]" -f ($c.set_name -join ' / '), $c.rarity)
    foreach ($f in 'xros_req', 'main_effect', 'source_effect', 'alt_effect') {
      if ($c.$f) { Write-Host ("  {0}: {1}" -f $f, ($c.$f -replace '\s*\r?\n\s*', ' / ')) }
    }
    Write-Host ("  img: {0}" -f (Join-Path $cardsDir $r.img))
  }
} else {
  $res | Select-Object @{n='ID';e={$_.id}},
                       @{n='Nombre';e={$_.name}},
                       @{n='Tipo';e={$_.type}},
                       @{n='Lv';e={$_.level}},
                       @{n='Coste';e={$_.cost}},
                       @{n='DP';e={$_.dp}},
                       @{n='Color';e={$_.color}},
                       @{n='Rar';e={$_.rarity}},
                       @{n='Rasgos';e={$_.traits}} |
    Format-Table -AutoSize | Out-String | Write-Host
}

Write-Host ("{0} resultado(s){1}" -f $total, $(if ($Take -gt 0 -and $total -gt $Take) { " (mostrando $Take, usa -Take 0 para todos)" } else { '' }))

if ($Open) {
  foreach ($r in $res) {
    $img = Join-Path $cardsDir $r.img
    if (Test-Path $img) { Invoke-Item -LiteralPath $img } else { Write-Warning "Sin imagen local: $($r.id)" }
  }
}
