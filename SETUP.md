# Guia de Configuração - Visualizar App no PC

## Opção 1: Usar Expo Go no Celular (Mais Rápido) ⚡

Esta é a forma mais rápida de ver o app funcionando:

1. **Instale o Expo Go no seu celular:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Execute o projeto:**
   ```bash
   npm run expo
   ```

3. **Escaneie o QR code** que aparecerá no terminal com o app Expo Go

4. **Pronto!** O app aparecerá no seu celular em tempo real.

---

## Opção 2: Configurar Emulador Android no PC 🖥️

Para usar o emulador Android, você precisa instalar o **Android Studio completo**:

### Passo 1: Instalar Android Studio

1. Baixe o Android Studio: https://developer.android.com/studio
2. Instale seguindo o assistente
3. Durante a instalação, certifique-se de instalar:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Passo 2: Configurar Variáveis de Ambiente

Adicione ao seu `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Depois execute:
```bash
source ~/.zshrc
```

### Passo 3: Criar um Emulador

1. Abra o Android Studio
2. Vá em **Tools > Device Manager**
3. Clique em **Create Device**
4. Escolha um dispositivo (ex: Pixel 5)
5. Escolha uma imagem do sistema (recomendado: API 33)
6. Finalize a criação

### Passo 4: Executar o App

```bash
npm run android
```

---

## Opção 3: Usar iOS Simulator (Apenas macOS) 🍎

Para iOS, você precisa do **Xcode completo** (não apenas Command Line Tools):

1. Instale o Xcode da App Store (é grande, ~15GB)
2. Abra o Xcode e aceite os termos de licença
3. Execute:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```
4. Instale os CocoaPods:
   ```bash
   cd ios
   pod install
   cd ..
   ```
5. Execute:
   ```bash
   npm run ios
   ```

---

## Verificando a Configuração

Execute para ver o que está configurado:
```bash
npx react-native doctor
```


