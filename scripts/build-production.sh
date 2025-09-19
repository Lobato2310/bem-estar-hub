#!/bin/bash

# MyFitLife - Script de Build Completo
# Gera builds para Web, Android e iOS

echo "🚀 MyFitLife - Build de Produção Completo"
echo "=========================================="

# Função para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 não está instalado"
        return 1
    fi
    return 0
}

# Verificar dependências básicas
echo "🔍 Verificando dependências..."
check_command npm || exit 1
check_command npx || exit 1

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação web
echo "🌐 Build da versão Web..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build Web concluído!"
else
    echo "❌ Erro no build Web"
    exit 1
fi

# Sincronizar com plataformas nativas
echo "🔄 Sincronizando com plataformas nativas..."
npx cap sync

# Menu de opções
echo ""
echo "🎯 Selecione o tipo de build:"
echo "1) Apenas Web (já concluído)"
echo "2) Android (.aab)"
echo "3) iOS (.ipa) - Requer macOS"
echo "4) Ambos (Android + iOS)"
echo "5) Pular builds nativos"

read -p "Escolha uma opção (1-5): " choice

case $choice in
    2|4)
        echo "📱 Iniciando build Android..."
        if [ -f "scripts/build-android.sh" ]; then
            chmod +x scripts/build-android.sh
            ./scripts/build-android.sh
        else
            echo "❌ Script build-android.sh não encontrado"
        fi
        ;;
esac

case $choice in
    3|4)
        echo "🍎 Iniciando build iOS..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if [ -f "scripts/build-ios.sh" ]; then
                chmod +x scripts/build-ios.sh
                ./scripts/build-ios.sh
            else
                echo "❌ Script build-ios.sh não encontrado"
            fi
        else
            echo "⚠️  Build iOS só é possível no macOS"
        fi
        ;;
esac

echo ""
echo "🎉 Build de produção finalizado!"
echo ""
echo "📁 Arquivos gerados:"
echo "- Web: dist/ (para deploy web)"
echo "- Android: android/app/build/outputs/bundle/release/app-release.aab"
echo "- iOS: Gerado via Xcode Organizer"
echo ""
echo "📚 Consulte BUILD_GUIDE.md para detalhes sobre upload nas lojas"