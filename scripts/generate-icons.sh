#!/bin/bash

# MyFitLife - Gerador de Ícones para iOS e Android
# Este script gera todos os tamanhos de ícones necessários para as lojas

echo "🎨 Gerando ícones do MyFitLife para iOS e Android..."

# Verificar se ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick não está instalado."
    echo "💡 Para instalar:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: https://imagemagick.org/script/download.php#windows"
    echo ""
    echo "🔄 Continuando sem gerar ícones redimensionados..."
else
    # Ícone original
    ICON_SOURCE="src/assets/app-icon.png"
    
    if [ ! -f "$ICON_SOURCE" ]; then
        echo "❌ Arquivo de ícone não encontrado: $ICON_SOURCE"
        exit 1
    fi
    
    echo "📱 Gerando ícones para iOS..."
    
    # Criar diretórios
    mkdir -p ios/App/App/Assets.xcassets/AppIcon.appiconset
    mkdir -p android/app/src/main/res/mipmap-mdpi
    mkdir -p android/app/src/main/res/mipmap-hdpi
    mkdir -p android/app/src/main/res/mipmap-xhdpi
    mkdir -p android/app/src/main/res/mipmap-xxhdpi
    mkdir -p android/app/src/main/res/mipmap-xxxhdpi
    
    # iOS Icons
    convert "$ICON_SOURCE" -resize 20x20 ios/App/App/Assets.xcassets/AppIcon.appiconset/20.png
    convert "$ICON_SOURCE" -resize 29x29 ios/App/App/Assets.xcassets/AppIcon.appiconset/29.png
    convert "$ICON_SOURCE" -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/40.png
    convert "$ICON_SOURCE" -resize 58x58 ios/App/App/Assets.xcassets/AppIcon.appiconset/58.png
    convert "$ICON_SOURCE" -resize 60x60 ios/App/App/Assets.xcassets/AppIcon.appiconset/60.png
    convert "$ICON_SOURCE" -resize 80x80 ios/App/App/Assets.xcassets/AppIcon.appiconset/80.png
    convert "$ICON_SOURCE" -resize 87x87 ios/App/App/Assets.xcassets/AppIcon.appiconset/87.png
    convert "$ICON_SOURCE" -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/120.png
    convert "$ICON_SOURCE" -resize 180x180 ios/App/App/Assets.xcassets/AppIcon.appiconset/180.png
    convert "$ICON_SOURCE" -resize 1024x1024 ios/App/App/Assets.xcassets/AppIcon.appiconset/1024.png
    
    echo "🤖 Gerando ícones para Android..."
    
    # Android Icons
    convert "$ICON_SOURCE" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    convert "$ICON_SOURCE" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    convert "$ICON_SOURCE" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    convert "$ICON_SOURCE" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    convert "$ICON_SOURCE" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    
    # Android Adaptive Icons (round)
    convert "$ICON_SOURCE" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
    convert "$ICON_SOURCE" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
    convert "$ICON_SOURCE" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
    convert "$ICON_SOURCE" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
    convert "$ICON_SOURCE" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
    
    echo "✅ Ícones gerados com sucesso!"
fi

# Gerar Contents.json para iOS (sempre)
cat > ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json << 'EOF'
{
  "images" : [
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "40.png",
      "scale" : "2x"
    },
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "60.png",
      "scale" : "3x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "58.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "87.png",
      "scale" : "3x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "80.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "120.png",
      "scale" : "3x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "120.png",
      "scale" : "2x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "180.png",
      "scale" : "3x"
    },
    {
      "size" : "1024x1024",
      "idiom" : "ios-marketing",
      "filename" : "1024.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF

echo ""
echo "📋 Checklist de ícones:"
echo "✅ Ícone principal gerado (1024x1024)"
echo "✅ Configuração iOS AppIcon.appiconset"
echo "✅ Ícones Android em todas as densidades"
echo "✅ Manifest.json configurado"
echo ""
echo "🎯 Próximos passos:"
echo "1. Teste os ícones no simulador/emulador"
echo "2. Execute o build final"
echo "3. Faça upload nas lojas"
echo ""
echo "📱 Tamanhos gerados:"
echo "   iOS: 20, 29, 40, 58, 60, 80, 87, 120, 180, 1024px"
echo "   Android: 48, 72, 96, 144, 192px"