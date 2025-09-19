# 📱 Guia de Build Nativo - MyFitLife

## 🎯 Objetivo
Este guia explica como gerar builds nativos oficiais para distribuição nas lojas (Google Play e App Store).

## ⚙️ Pré-requisitos

### Para Android:
- Android Studio instalado
- Java JDK 11 ou superior
- Keystore para assinatura (ou usar o de desenvolvimento gerado automaticamente)

### Para iOS:
- macOS com Xcode instalado
- Conta Apple Developer ativa
- Certificados de assinatura configurados

## 🚀 Processo de Build

### 1. Preparação Inicial
```bash
# Clonar o projeto do GitHub
git clone [SEU_REPOSITORIO]
cd [NOME_DO_PROJETO]

# Instalar dependências
npm install

# Adicionar plataformas nativas
npx cap add android
npx cap add ios
```

### 2. Build Android (.aab)

#### Automático (Recomendado):
```bash
# Dar permissão de execução
chmod +x scripts/build-android.sh

# Executar script de build
./scripts/build-android.sh
```

#### Manual:
```bash
# Build da web
npm run build

# Sincronizar
npx cap sync android

# Build do AAB
cd android
./gradlew bundleRelease
```

**Saída**: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Build iOS (.ipa)

#### Automático (Preparação):
```bash
# Dar permissão de execução
chmod +x scripts/build-ios.sh

# Executar script (abre Xcode)
./scripts/build-ios.sh
```

#### Manual no Xcode:
1. `npx cap open ios`
2. Configurar Team ID e certificados
3. Product → Archive
4. Window → Organizer → Distribute App
5. Escolher "App Store Connect"

## 🔐 Configuração de Assinatura

### Android - Keystore de Produção:
```bash
# Gerar keystore oficial (faça uma vez e guarde com segurança)
keytool -genkey -v -keystore release-key.keystore \
    -alias myfitlife-key -keyalg RSA -keysize 2048 -validity 10000

# Configurar no android/gradle.properties:
MYAPP_UPLOAD_STORE_FILE=../release-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=SUA_SENHA_FORTE
MYAPP_UPLOAD_KEY_ALIAS=myfitlife-key
MYAPP_UPLOAD_KEY_PASSWORD=SUA_SENHA_FORTE
```

### iOS - Certificados:
1. Apple Developer Account → Certificates
2. Criar "iOS Distribution Certificate"
3. Criar "App Store Provisioning Profile"
4. Baixar e instalar no Xcode

## 📊 Versionamento

Atualize a versão antes do build:

### Android (`android/app/build.gradle`):
```gradle
defaultConfig {
    versionCode 2        // Incrementar a cada build
    versionName "1.0.1"  // Versão semântica
}
```

### iOS (`ios/App/App.xcodeproj`):
- **Version**: 1.0.1 (marketing version)
- **Build**: 2 (incrementar sempre)

## 🎛️ Configurações de Produção

### Remover Hot Reload:
O `capacitor.config.ts` já está configurado para desabilitar o servidor de desenvolvimento em produção automaticamente.

### Otimizações Web:
- Minificação habilitada no Vite
- Tree shaking automático
- Chunks otimizados para mobile

## 📤 Upload para as Lojas

### Google Play Console:
1. Acessar [Google Play Console](https://play.google.com/console)
2. Criar novo app ou selecionar existente
3. Upload do arquivo `.aab`
4. Preencher informações da loja
5. Configurar assinatura da app (recomendado)

### App Store Connect:
1. Acessar [App Store Connect](https://appstoreconnect.apple.com)
2. Criar novo app ou selecionar existente
3. Usar Xcode Organizer ou Transporter para upload
4. Preencher informações da loja
5. Submeter para revisão

## 🔧 Troubleshooting

### Erro de Assinatura Android:
```bash
# Verificar keystore
keytool -list -v -keystore release-key.keystore

# Recriar se necessário
rm release-key.keystore
./scripts/build-android.sh
```

### Erro de Certificado iOS:
1. Verificar validade dos certificados
2. Renovar se expirados
3. Recriar provisioning profiles
4. Clean build folder no Xcode

### Build Web Não Carrega:
```bash
# Limpar cache e rebuildar
rm -rf dist node_modules
npm install
npm run build
npx cap sync
```

## 📈 Automação CI/CD

Para builds automatizados, considere:
- **Android**: GitHub Actions com secrets para keystore
- **iOS**: Fastlane + GitHub Actions
- **Ambos**: Bitrise, AppCenter, ou Codemagic

## 🌐 Versão Web

A versão web continua funcionando normalmente em:
- **Produção**: myfitlife.lovable.app
- **Desenvolvimento**: localhost:8080

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do build
2. Consultar documentação oficial do Capacitor
3. Verificar compatibilidade de versões
4. Testar em device físico antes do upload

---

✅ **Status**: Projeto configurado e pronto para builds de produção!