# 📱 Configuração Mobile - MyFitLife

O projeto já está configurado para desenvolvimento mobile com Capacitor. Siga os passos abaixo para gerar os apps nativos:

## 🚀 Próximos Passos

### 1. Exportar para GitHub
- Use o botão "Export to GitHub" no Lovable
- Faça `git pull` do seu repositório

### 2. Instalar Dependências
```bash
npm install
```

### 3. Adicionar Plataformas
```bash
# Para iOS (requer macOS com Xcode)
npx cap add ios

# Para Android (requer Android Studio)
npx cap add android
```

### 4. Atualizar Dependências Nativas
```bash
npx cap update ios
npx cap update android
```

### 5. Build do Projeto
```bash
npm run build
```

### 6. Sincronizar com Plataformas Nativas
```bash
npx cap sync
```

### 7. Executar no Dispositivo/Emulador
```bash
# Para Android
npx cap run android

# Para iOS (somente macOS)
npx cap run ios
```

## ⚙️ Configurações Implementadas

- **App ID**: `com.lobato.myfitlife`
- **App Name**: `MyFitLife` 
- **Deep Links**: Suporte a `myfitlife://` e `https://myfitlife.lovable.app`
- **Hot Reload**: Configurado para desenvolvimento
- **Supabase**: Totalmente compatível com mobile

## 🔗 Deep Links

O app responde aos seguintes esquemas:
- `myfitlife://` (esquema customizado)
- `https://myfitlife.lovable.app` (universal links)

## 📚 Recursos Adicionais

Para mais detalhes sobre desenvolvimento mobile no Lovable:
👉 [Blog: Mobile App Development](https://lovable.dev/blogs/TODO)

## ⚠️ Importante

- Sempre execute `npx cap sync` após alterações no código
- Para iOS: necessário macOS com Xcode instalado
- Para Android: necessário Android Studio instalado
- A versão web continua funcionando normalmente em myfitlife.lovable.app