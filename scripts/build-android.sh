#!/bin/bash

# MyFitLife - Script de Build Android (.aab)
# Este script gera um Android App Bundle assinado para o Google Play

echo "🚀 Iniciando build Android (.aab) do MyFitLife..."

# Verificar se as dependências estão instaladas
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não está instalado"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ NPX não está instalado"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação web
echo "🔨 Fazendo build da aplicação web..."
npm run build

# Sincronizar com Android
echo "🔄 Sincronizando com Android..."
npx cap sync android

# Verificar se existe keystore para assinatura
if [ ! -f "android/release-key.keystore" ]; then
    echo "⚠️  Keystore não encontrado. Gerando keystore de desenvolvimento..."
    echo "📝 Para produção, substitua por um keystore oficial!"
    
    # Gerar keystore de desenvolvimento
    keytool -genkey -v -keystore android/release-key.keystore \
        -alias myfitlife-key -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android \
        -dname "CN=MyFitLife,OU=Development,O=Lobato,L=Brazil,S=Brazil,C=BR"
fi

# Criar arquivo gradle.properties com credenciais
cat > android/gradle.properties << EOF
MYAPP_UPLOAD_STORE_FILE=release-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=android
MYAPP_UPLOAD_KEY_ALIAS=myfitlife-key
MYAPP_UPLOAD_KEY_PASSWORD=android
EOF

# Build do AAB
echo "📱 Gerando Android App Bundle (.aab)..."
cd android
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo "✅ Build Android concluído com sucesso!"
    echo "📁 Arquivo gerado: android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "🎯 Próximos passos:"
    echo "1. Faça upload do .aab no Google Play Console"
    echo "2. Configure a assinatura da app no Play Console (recomendado)"
    echo "3. Para produção, substitua o keystore de desenvolvimento por um oficial"
else
    echo "❌ Erro no build Android"
    exit 1
fi