# Configuração Rápida do Android SDK

O erro do Expo aconteceu porque este é um projeto React Native puro. Para visualizar no PC, você precisa configurar o Android SDK.

## Solução Rápida: Instalar Android Studio

A forma mais fácil é instalar o Android Studio completo:

1. **Baixe o Android Studio:**
   - https://developer.android.com/studio
   - Ou via Homebrew: `brew install --cask android-studio`

2. **Instale e configure:**
   - Abra o Android Studio
   - Vá em **More Actions > SDK Manager**
   - Instale:
     - Android SDK Platform 33
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

3. **Configure as variáveis de ambiente:**

   Adicione ao final do arquivo `~/.zshrc`:
   
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

4. **Crie um emulador:**
   - No Android Studio: **Tools > Device Manager**
   - Clique em **Create Device**
   - Escolha um dispositivo (ex: Pixel 5)
   - Escolha uma imagem (API 33 - Android 13)
   - Finalize

5. **Execute o app:**
   ```bash
   npm start        # Terminal 1 - Metro Bundler
   npm run android  # Terminal 2 - Build e instala no emulador
   ```

## Alternativa: Usar Dispositivo Físico

Se você tem um celular Android:

1. **Ative o Modo Desenvolvedor:**
   - Vá em Configurações > Sobre o telefone
   - Toque 7 vezes em "Número da versão"

2. **Ative Depuração USB:**
   - Configurações > Opções do desenvolvedor
   - Ative "Depuração USB"

3. **Conecte via USB e execute:**
   ```bash
   npm run android
   ```

## Verificar se está funcionando:

```bash
# Verificar se adb está funcionando
adb devices

# Verificar se emulador está disponível
emulator -list-avds
```


