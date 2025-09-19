#!/bin/bash

# MyFitLife - Script de Build iOS (.ipa)
# Este script gera um arquivo .ipa para o App Store

echo "🍎 Iniciando build iOS (.ipa) do MyFitLife..."

# Verificar se estamos no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Build iOS só é possível no macOS"
    exit 1
fi

# Verificar se o Xcode está instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode não está instalado"
    exit 1
fi

# Verificar se as dependências estão instaladas
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não está instalado"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação web
echo "🔨 Fazendo build da aplicação web..."
npm run build

# Sincronizar com iOS
echo "🔄 Sincronizando com iOS..."
npx cap sync ios

# Abrir Xcode para configuração manual
echo "📱 Abrindo Xcode para build manual..."
echo ""
echo "🎯 Instruções para build no Xcode:"
echo "1. Configure seu Team ID no projeto"
echo "2. Configure os certificados de assinatura"
echo "3. Selecione 'Any iOS Device' como destino"
echo "4. Product → Archive"
echo "5. Window → Organizer → Distribute App"
echo "6. Escolha 'App Store Connect'"
echo ""

# Abrir o projeto no Xcode
npx cap open ios

echo "✅ Projeto iOS aberto no Xcode!"
echo ""
echo "📝 Notas importantes:"
echo "- Certifique-se de ter uma conta Apple Developer ativa"
echo "- Configure o Team ID correto em capacitor.config.ts"
echo "- Para automatizar builds, considere usar fastlane"