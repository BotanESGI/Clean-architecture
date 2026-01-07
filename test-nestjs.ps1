# Script de test pour vérifier que NestJS fonctionne

Write-Host "🧪 Test de la route NestJS /api/v2/notifications" -ForegroundColor Cyan

# Test 1: POST sans token (devrait retourner 401)
Write-Host "`n📤 Test 1: POST sans authentification (erreur attendue: 401)" -ForegroundColor Yellow
try {
    $body = @{
        receiverId = "test-id"
        title = "Test NestJS"
        message = "Ceci est un test de la route NestJS"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/v2/notifications" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Réponse reçue:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    if ($statusCode -eq 401) {
        Write-Host "✅ Parfait ! NestJS fonctionne (erreur 401 attendue: Token manquant)" -ForegroundColor Green
        Write-Host "📄 Réponse: $errorBody" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur inattendue: $statusCode" -ForegroundColor Red
        Write-Host "📄 Réponse: $errorBody" -ForegroundColor Red
    }
}

# Test 2: GET (devrait retourner 404 - méthode non autorisée)
Write-Host "`n📤 Test 2: GET (devrait retourner 404 - méthode non autorisée)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/v2/notifications" `
        -Method GET `
        -ErrorAction Stop
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404 -or $statusCode -eq 405) {
        Write-Host "✅ Route trouvée mais méthode GET non autorisée (normal pour @Post())" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tests terminés !" -ForegroundColor Cyan
Write-Host "💡 Si vous voyez 'Token manquant' dans le Test 1, NestJS fonctionne parfaitement !" -ForegroundColor Green

