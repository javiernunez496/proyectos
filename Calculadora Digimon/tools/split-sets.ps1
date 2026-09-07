<#
.SYNOPSIS
  Parte el catalogo (data/cards/cards.json) en un archivo por expansion.

.DESCRIPTION
  Hay dos maneras de agrupar las cartas y el script escribe las dos, porque
  responden a preguntas distintas:

  1. Por expansion de origen, que es el prefijo del ID: BT24-101 es de BT-24.
     Cada carta cae en una sola, asi que los totales suman el catalogo entero.
     Va a data/cards/sets/<CODIGO>.json, con la ficha completa de cada carta.

  2. Por producto en el que aparece (el campo set_name). Una carta reimpresa
     sale en varios: starters, packs promocionales, boosters especiales. Los
     grupos se solapan. Va a data/cards/sets/_products.json, solo con IDs.

  Ademas escribe _sets.json: la lista de expansiones con su nombre oficial, el
  numero de cartas y el archivo donde estan.

.PARAMETER Quiet
  No imprime la tabla de expansiones.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\split-sets.ps1
#>
[CmdletBinding()]
param([switch]$Quiet)

$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot
$cardsDir  = Join-Path $root 'data\cards'
$cardsPath = Join-Path $cardsDir 'cards.json'
$setsDir   = Join-Path $cardsDir 'sets'

if (-not (Test-Path $cardsPath)) { throw "Falta $cardsPath. Ejecuta antes tools\fetch-cards.ps1." }
New-Item -ItemType Directory -Force -Path $setsDir | Out-Null

function Write-Utf8Json([string]$path, $object, [int]$depth = 12) {
  $json = $object | ConvertTo-Json -Depth $depth
  [IO.File]::WriteAllText($path, $json, (New-Object Text.UTF8Encoding($false)))
}

# ConvertFrom-Json de PowerShell 5.1 emite el array entero como un solo objeto,
# asi que hay que asignarlo antes de envolverlo: @(...) directo daria un elemento.
$cards = Get-Content -LiteralPath $cardsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$cards = @($cards)
Write-Host ("{0} cartas en el catalogo" -f $cards.Count)

# "BT24-101" -> "BT24".  "P-194" -> "P".
function Get-Code([string]$id) {
  if ($id -match '^([A-Za-z]+\d*)-') { return $Matches[1].ToUpperInvariant() }
  return 'OTROS'
}

# Codigo comparable sin ceros de relleno: "BT-24" y "BT24" dan "BT|24";
# "ST-1", "ST-01" y "ST1" dan "ST|1". Sirve para casar el prefijo del ID con
# el nombre oficial del set, que no rellena igual en todas las lineas.
function Get-Key([string]$code) {
  if ($code -match '^([A-Za-z]+)-?(\d+)$') { return ('{0}|{1}' -f $Matches[1].ToUpperInvariant(), [int]$Matches[2]) }
  return $code.ToUpperInvariant()
}

# Orden natural: BT-1 antes que BT-10, y las lineas agrupadas.
function Get-Sort([string]$code) {
  if ($code -match '^([A-Za-z]+)(\d+)$') { return @($Matches[1], [int]$Matches[2]) }
  return @($code, 0)
}

# --- 1. Por expansion de origen ----------------------------------------------

$groups = $cards | Group-Object { Get-Code $_.id }
$rows   = New-Object System.Collections.ArrayList
$sets   = New-Object System.Collections.ArrayList

foreach ($g in ($groups | Sort-Object @{ Expression = { (Get-Sort $_.Name)[0] } },
                                      @{ Expression = { (Get-Sort $_.Name)[1] } })) {
  $code = $g.Name

  # Letras y numero del prefijo. "BT24" -> BT/24; "LM" y "P" no llevan numero,
  # aunque su set si lo lleve ("LM-01"), asi que ahi basta con que casen las letras.
  $null = $code -match '^([A-Za-z]+)(\d*)$'
  $codeLetters = $Matches[1].ToUpperInvariant()
  $codeNum     = if ($Matches[2]) { [int]$Matches[2] } else { $null }

  # Nombre oficial: el set_name mas repetido cuyo codigo coincide con el prefijo.
  # Una carta de BT-24 aparece tambien en packs promocionales, y esos no cuentan.
  $named = $g.Group | ForEach-Object { @($_.set_name) } | Where-Object { $_ } |
           Where-Object {
             $_ -match '^([A-Za-z]+)-?(\d+)\s*:' -and
             $Matches[1].ToUpperInvariant() -eq $codeLetters -and
             ($null -eq $codeNum -or [int]$Matches[2] -eq $codeNum)
           }
  $ownSets = @($named | Sort-Object -Unique)

  # Los productos donde acaban las cartas del grupo, de mas a menos frecuente.
  $top = @($g.Group | ForEach-Object { @($_.set_name) } | Where-Object { $_ } |
           Group-Object | Sort-Object Count -Descending |
           ForEach-Object { [ordered]@{ name = $_.Name; cards = $_.Count } })

  if ($ownSets.Count -eq 1) {
    $name = $ownSets[0]
  } elseif ($ownSets.Count -gt 1) {
    # Un prefijo sin numero puede cubrir varios packs de la misma linea: los 68
    # LM-xxx vienen de nueve Limited Card Packs, y quedarse con el primero
    # describiria 20 cartas de 68.
    $codes = @($ownSets | ForEach-Object { if ($_ -match '^([A-Za-z]+-?\d+)\s*:') { $Matches[1] } } |
               Sort-Object -Unique)
    $name  = "{0}: {1} productos ({2})" -f $code, $ownSets.Count, (@($codes[0], $codes[-1]) -join ' a ')
  } else {
    # Sin set propio: las promos (P-xxx) salen repartidas entre decenas de
    # campanas, asi que ponerles el nombre del producto mas frecuente mentiria.
    $name = "{0}: sin set propio ({1} productos distintos)" -f $code, $top.Count
  }

  $inSet = @($g.Group | Sort-Object @{ Expression = { if ($_.id -match '-(\d+)') { [int]$Matches[1] } else { 0 } } }, id)
  $file  = "$code.json"
  Write-Utf8Json (Join-Path $setsDir $file) ([ordered]@{
    code     = $code
    name     = $name
    cards    = $inSet.Count
    products = $top
    list     = $inSet
  })

  $dates = @($inSet | ForEach-Object { $_.date_added } | Where-Object { $_ } | Sort-Object)
  [void]$sets.Add([ordered]@{
    code    = $code
    name    = $name
    cards   = $inSet.Count
    file    = "sets/$file"
    first   = if ($dates) { $dates[0] } else { $null }
    last    = if ($dates) { $dates[-1] } else { $null }
    images  = @($inSet | Where-Object { $_.image_file }).Count
  })
  [void]$rows.Add([pscustomobject]@{
    Codigo = $code
    Cartas = $inSet.Count
    Nombre = $name
  })
}

Write-Utf8Json (Join-Path $setsDir '_sets.json') ([ordered]@{
  generated = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  grouping  = 'prefijo del ID de carta: cada carta pertenece a una sola expansion'
  total     = $cards.Count
  sets      = @($sets)
})

# --- 2. Por producto en el que aparece ---------------------------------------

$products = @{}
foreach ($c in $cards) {
  foreach ($s in @($c.set_name)) {
    if (-not $s) { continue }
    if (-not $products.ContainsKey($s)) { $products[$s] = New-Object System.Collections.ArrayList }
    [void]$products[$s].Add($c.id)
  }
}
$noSet = @($cards | Where-Object { -not @($_.set_name).Count })

$prodList = foreach ($k in ($products.Keys | Sort-Object)) {
  [ordered]@{ name = $k; cards = $products[$k].Count; ids = @($products[$k] | Sort-Object) }
}
Write-Utf8Json (Join-Path $setsDir '_products.json') ([ordered]@{
  generated = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  grouping  = 'campo set_name: una carta reimpresa aparece en varios productos, los grupos se solapan'
  products  = $products.Count
  orphans   = @($noSet | ForEach-Object { $_.id })
  list      = @($prodList)
})

# --- 3. Resumen --------------------------------------------------------------

if (-not $Quiet) { $rows | Format-Table -AutoSize | Out-String | Write-Host }

Write-Host ("{0} expansiones (por ID) -> {1}" -f $sets.Count, $setsDir)
Write-Host ("{0} productos distintos (por set_name) -> _products.json" -f $products.Count)
if ($noSet.Count) { Write-Host ("{0} cartas sin producto asignado, listadas en 'orphans'" -f $noSet.Count) }
