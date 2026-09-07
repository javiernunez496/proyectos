<#
    Deja la versión publicable en docs/, que es la carpeta que sirve
    GitHub Pages. Solo se copia la calculadora: el otro proyecto del
    repositorio se queda sin publicar.

    Compila primero, para no publicar nunca una versión vieja por error.

    No se ejecuta a mano: usa "publicar.bat" (doble clic).
#>

$ErrorActionPreference = 'Stop'

$proyecto = Split-Path -Parent $PSScriptRoot
$repo     = Split-Path -Parent $proyecto
$docs     = Join-Path $repo 'docs'

Write-Host ''
Write-Host '  Publicar Digimon Analytics' -ForegroundColor Cyan
Write-Host '  --------------------------'

# 1. Compilar, para que lo publicado sea lo que hay ahora en src/
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'compilar.ps1')
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host '  La compilación falló: no se publica nada.' -ForegroundColor Red
    Read-Host '  Enter para cerrar'
    exit 1
}

$origen = Join-Path $proyecto 'dist\index.html'
if (-not (Test-Path -LiteralPath $origen)) {
    Write-Host '  No hay dist\index.html que publicar.' -ForegroundColor Red
    Read-Host '  Enter para cerrar'
    exit 1
}

if (-not (Test-Path -LiteralPath $docs)) { New-Item -ItemType Directory -Path $docs | Out-Null }

# .nojekyll: sin esto GitHub Pages pasa el sitio por Jekyll, que se come las
# carpetas y archivos que empiezan por guion bajo. Aquí no hace falta nada de eso.
$nojekyll = Join-Path $docs '.nojekyll'
if (-not (Test-Path -LiteralPath $nojekyll)) { New-Item -ItemType File -Path $nojekyll | Out-Null }

Copy-Item -LiteralPath $origen -Destination (Join-Path $docs 'index.html') -Force

$kb = '{0:N1} KB' -f ((Get-Item (Join-Path $docs 'index.html')).Length / 1024)
Write-Host ''
Write-Host ("  Copiado a docs\index.html  ({0})" -f $kb) -ForegroundColor Green
Write-Host ''
Write-Host '  Falta subirlo. Desde la raiz del repositorio:'
Write-Host '    git add docs' -ForegroundColor Yellow
Write-Host '    git commit -m "Publicar Digimon Analytics"' -ForegroundColor Yellow
Write-Host '    git push' -ForegroundColor Yellow
Write-Host ''
Write-Host '  Pages sirve lo que haya en docs/ de la rama configurada (master).'
Write-Host ''
Read-Host '  Enter para cerrar'
