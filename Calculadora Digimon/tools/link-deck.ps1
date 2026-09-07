<#
.SYNOPSIS
  Enlaza cada carta de data/deck.json con su carta real del catalogo (data/cards/index.json).

.DESCRIPTION
  Busca por nombre normalizado y desempata con nivel, tipo, coste y DP. Escribe
  data/deck.linked.json: el mismo mazo mas, en cada carta, los campos

    id     ID oficial (p. ej. "BT24-101")
    img    ruta relativa a la imagen dentro de data/cards/
    color, rarity, traits   del catalogo
    match  "exact" (nombre + nivel + coste + DP), "partial" (falta algun dato)
           o "none" (no se encontro)
    alts   otros IDs que tambien encajaban, si los hubo

  Nunca toca deck.json: el original sigue siendo la fuente de verdad.

  Cuando varias reimpresiones encajan igual de bien (mismo nombre, nivel, coste
  y DP), gana la que comparte mas rasgos con el resto del mazo, luego la que no
  es promo, y por ultimo la del set mas reciente. Para fijar una carta concreta,
  anade "id": "BT24-043" a esa carta en deck.json: el enlazador lo respeta.

.PARAMETER Report
  Solo imprime el informe, sin escribir el archivo.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\link-deck.ps1
#>
[CmdletBinding()]
param([switch]$Report)

$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot
$deckPath  = Join-Path $root 'data\deck.json'
$indexPath = Join-Path $root 'data\cards\index.json'
$outPath   = Join-Path $root 'data\deck.linked.json'

foreach ($p in @($deckPath, $indexPath)) {
  if (-not (Test-Path $p)) { throw "Falta $p. Ejecuta antes tools\fetch-cards.ps1." }
}

$deck  = Get-Content -LiteralPath $deckPath  -Raw -Encoding UTF8 | ConvertFrom-Json
$index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json

# "Aegiochusmon: Blue" -> "aegiochusmon blue".  Las cartas de doble cara se
# escriben "A // B" en el mazo; el catalogo solo conoce la cara principal.
function Normalize([string]$s) {
  if (-not $s) { return '' }
  $s = ($s -split '//')[0]
  $s = $s.ToLowerInvariant() -replace '[^a-z0-9 ]', ' '
  return ($s -replace '\s+', ' ').Trim()
}

# Nivel numerico a partir del grupo del mazo; $null para Tamer y Option.
function GroupLevel([string]$g) {
  if ($g -match '^Lv\.(\d+)$') { return [int]$Matches[1] }
  return $null
}

$byName = @{}
$byId   = @{}
foreach ($c in $index) {
  $k = Normalize $c.name
  if (-not $byName.ContainsKey($k)) { $byName[$k] = New-Object System.Collections.ArrayList }
  [void]$byName[$k].Add($c)
  $byId[$c.id] = $c
}

# Devuelve los candidatos que quedan tras filtrar por nivel/tipo, coste y DP.
# Cada filtro solo se aplica si deja algo: asi una carta con un DP mal
# transcrito sigue encontrando su nombre en vez de quedarse sin enlazar.
function Find-Candidates($card, $level) {
  $name  = Normalize $card.n
  $cands = @()
  if ($byName.ContainsKey($name)) { $cands = @($byName[$name]) }
  # Sin coincidencia exacta de nombre: por prefijo (sufijos de forma, "ACE"...).
  if ($cands.Count -eq 0 -and $name) {
    $cands = @($index | Where-Object { (Normalize $_.name).StartsWith($name) })
  }

  $step = $cands
  if ($level) {
    $f = @($step | Where-Object { $_.level -eq $level }); if ($f.Count) { $step = $f }
  } elseif ($card.g -in @('Tamer', 'Option')) {
    $f = @($step | Where-Object { $_.type -eq $card.g }); if ($f.Count) { $step = $f }
  }
  $f = @($step | Where-Object { $_.cost -eq $card.c }); if ($f.Count) { $step = $f }
  if ($card.dp -gt 0) {
    $f = @($step | Where-Object { $_.dp -eq $card.dp }); if ($f.Count) { $step = $f }
  }
  return @($step)
}

function Split-Traits($s) {
  if (-not $s) { return @() }
  return @($s -split '\s*/\s*' | Where-Object { $_ })
}

# --- Pasada 1: perfil del mazo -----------------------------------------------
# Los rasgos y colores de las cartas que salen sin ambiguedad describen el mazo
# ("TS", "Iliad", Yellow...) y sirven para elegir entre reimpresiones empatadas.
$traitWeight = @{}
$colorWeight = @{}
foreach ($card in $deck.cards) {
  $c = Find-Candidates $card (GroupLevel $card.g)
  if ($c.Count -ne 1) { continue }
  foreach ($t in (Split-Traits $c[0].traits)) { $traitWeight[$t] = 1 + [int]$traitWeight[$t] }
  if ($c[0].color) { $colorWeight[$c[0].color] = 1 + [int]$colorWeight[$c[0].color] }
}

# Numero de set, para preferir la impresion mas reciente a igualdad de todo.
function Set-Rank([string]$id) {
  if ($id -match '^[A-Z]+(\d+)-') { return [int]$Matches[1] }
  return 0
}

function Score-Candidate($c) {
  $s = 0
  foreach ($t in (Split-Traits $c.traits)) { $s += 3 * [int]$traitWeight[$t] }
  if ($c.color) { $s += [int]$colorWeight[$c.color] }
  if ($c.id -notlike 'P-*') { $s += 5 }        # una promo rara vez es la impresion de referencia
  return $s
}

# --- Pasada 2: enlazado ------------------------------------------------------
$linked = New-Object System.Collections.ArrayList
$stats  = @{ exact = 0; partial = 0; pinned = 0; none = 0 }
$rows   = New-Object System.Collections.ArrayList
$used   = @{}

foreach ($card in $deck.cards) {
  $level = GroupLevel $card.g

  # Un "id" escrito a mano en deck.json manda sobre cualquier heuristica.
  $pinned = $card.PSObject.Properties['id'] -and $card.id -and $byId.ContainsKey($card.id)
  if ($pinned) {
    $step = @($byId[$card.id])
  } else {
    $step = @(Find-Candidates $card $level |
              Sort-Object @{ Expression = { Score-Candidate $_ }; Descending = $true },
                          @{ Expression = { Set-Rank $_.id };     Descending = $true },
                          id)
    # Dos filas del mazo con los mismos datos son dos impresiones distintas de
    # la misma carta (el limite de 4 copias es por numero, no por nombre), asi
    # que no repetimos un ID que ya se asigno mientras queden alternativas.
    $free = @($step | Where-Object { -not $used.ContainsKey($_.id) })
    if ($free.Count) { $step = $free }
  }

  $hit  = if ($step.Count) { $step[0] } else { $null }
  if ($hit) { $used[$hit.id] = $true }
  $kind = 'none'
  if ($pinned) {
    $kind = 'pinned'
  } elseif ($hit) {
    $levelOk = (-not $level) -or ($hit.level -eq $level)
    $costOk  = ($hit.cost -eq $card.c)
    $dpOk    = ($card.dp -le 0) -or ($hit.dp -eq $card.dp)
    $kind    = if ($levelOk -and $costOk -and $dpOk) { 'exact' } else { 'partial' }
  }
  $stats[$kind]++

  $out = [ordered]@{}
  foreach ($prop in $card.PSObject.Properties) { $out[$prop.Name] = $prop.Value }
  if ($hit) {
    $out['id']     = $hit.id
    $out['img']    = $hit.img
    $out['color']  = $hit.color
    $out['rarity'] = $hit.rarity
    $out['traits'] = $hit.traits
  }
  $out['match'] = $kind
  if ($step.Count -gt 1) { $out['alts'] = @($step | Select-Object -Skip 1 | ForEach-Object { $_.id }) }
  [void]$linked.Add([pscustomobject]$out)

  [void]$rows.Add([pscustomobject]@{
    Carta  = $card.n
    Grupo  = $card.g
    Coste  = $card.c
    DP     = $card.dp
    ID     = if ($hit) { $hit.id } else { '-' }
    Color  = if ($hit) { $hit.color } else { '' }
    Rareza = if ($hit) { $hit.rarity } else { '' }
    Match  = $kind
    Otras  = if ($step.Count -gt 1) { $step.Count - 1 } else { 0 }
  })
}

$rows | Format-Table -AutoSize | Out-String | Write-Host
Write-Host ("exactas: {0}   fijadas: {1}   parciales: {2}   sin encontrar: {3}" -f `
  $stats.exact, $stats.pinned, $stats.partial, $stats.none)

$ambiguous = @($linked | Where-Object { $_.match -eq 'exact' -and $_.alts })
if ($ambiguous.Count) {
  Write-Host ""
  Write-Host "Reimpresiones que encajaban igual de bien (fija el ID en deck.json si quieres otra):"
  foreach ($a in $ambiguous) {
    Write-Host ("  {0,-28} -> {1}   otras: {2}" -f $a.n, $a.id, ($a.alts -join ', '))
  }
}

if (-not $Report) {
  $result = [ordered]@{}
  foreach ($prop in $deck.PSObject.Properties) { $result[$prop.Name] = $prop.Value }
  $result['cards']  = @($linked)
  $result['linked'] = [ordered]@{
    at      = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    source  = 'data/cards/index.json'
    exact   = $stats.exact
    pinned  = $stats.pinned
    partial = $stats.partial
    none    = $stats.none
  }
  $json = $result | ConvertTo-Json -Depth 12
  [IO.File]::WriteAllText($outPath, $json, (New-Object Text.UTF8Encoding($false)))
  Write-Host "`nEscrito $outPath"
}
