# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD para o projeto BusKa.

## 📋 Workflows Disponíveis

### 🔨 android-build.yml
**Propósito:** Build de desenvolvimento automático

**Quando executa:**
- ✅ Push para `main`
- ✅ Pull requests para `main` ou `release/*` 
- ✅ Manualmente via GitHub Actions UI

**O que gera:**
- APK de debug/release
- Disponível como artifact por 30 dias

---

### 🚀 android-release.yml
**Propósito:** Build de produção com criação automática de GitHub Releases

**Quando executa:**
- ✅ Ao criar uma tag (ex: `v1.0.0`, `v2.1.3`)

**O que gera:**
- APK assinado para produção
- Cria GitHub Release com APK anexado
- Nomeia APK com versão (ex: `buska-1.0.0.apk`)

**Requer:** Secrets configurados para assinatura

---

## 🎯 Comandos Rápidos

### Acionar build de produção com criação de release automático
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Ver status dos workflows
```bash
# Via browser
https://github.com/BusKa-org/buska-frontend/actions

# Via CLI (gh)
gh workflow list
gh run list
gh run view <run-id>
```

---

## 🔐 Secrets Necessários (Opcional)

Para builds de produção assinados, configure estes secrets:

| Secret | Descrição | Como obter |
|--------|-----------|------------|
| `KEYSTORE_BASE64` | Keystore em base64 | `base64 -i release.keystore` |
| `KEYSTORE_PASSWORD` | Senha do keystore | Definida ao criar keystore |
| `KEY_ALIAS` | Alias da chave | Definido ao criar keystore |
| `KEY_PASSWORD` | Senha da chave | Definida ao criar keystore |

**Configurar em:** `Settings` → `Secrets and variables` → `Actions`

---

## 📥 Como Baixar APKs

### Método 1: Artifacts (builds normais)
1. Acesse a aba **Actions**
2. Clique no workflow executado
3. Role até **Artifacts**
4. Clique para baixar

### Método 2: Releases (builds de produção)
1. Acesse a aba **Releases**
2. Selecione a versão
3. Baixe o APK anexado

---

## 🛠️ Modificar Workflows

### Adicionar nova branch para build automático
Edite:
```yaml
on:
  push:
    branches:
      - main
      - sua-nova-branch  # Adicione aqui
```

### Mudar retenção de artifacts
```yaml
- name: Upload APK artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 60  # Mude para 60 dias
```

### Adicionar notificações do Slack
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    message: "✅ APK build completed!"
```

---

## 🐛 Troubleshooting

### APK não é gerado
**Solução:** Verifique se o caminho do APK está correto em `upload-artifact`

### Cache não funciona
**Solução:** O cache usa hash dos arquivos gradle. Se mudar versões, o cache será invalidado (esperado)

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [React Native - Publishing Android](https://reactnative.dev/docs/signed-apk-android)
- [Gradle Build Android](https://developer.android.com/studio/build/building-cmdline)
