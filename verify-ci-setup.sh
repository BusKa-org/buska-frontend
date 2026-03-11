#!/bin/bash

echo "🔍 Verificando configuração do CI/CD..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js instalado: $NODE_VERSION"
else
    error "Node.js não encontrado"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm instalado: $NPM_VERSION"
else
    error "npm não encontrado"
fi

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    success "Java instalado: $JAVA_VERSION"
else
    error "Java não encontrado"
fi

# Check Android SDK
if [ -d "$ANDROID_HOME" ] || [ -d "$HOME/Library/Android/sdk" ]; then
    success "Android SDK encontrado"
else
    warning "Android SDK não encontrado (necessário apenas para builds locais)"
fi

# Check Gradle wrapper
if [ -f "android/gradlew" ]; then
    success "Gradle wrapper encontrado"
else
    error "Gradle wrapper não encontrado"
fi

# Check GitHub workflows
if [ -d ".github/workflows" ]; then
    success "Diretório .github/workflows existe"
    
    if [ -f ".github/workflows/android-build.yml" ]; then
        success "Workflow android-build.yml configurado"
    else
        error "Workflow android-build.yml não encontrado"
    fi
    
    if [ -f ".github/workflows/android-release.yml" ]; then
        success "Workflow android-release.yml configurado"
    else
        error "Workflow android-release.yml não encontrado"
    fi
else
    error "Diretório .github/workflows não encontrado"
fi

# Check if it's a git repository
if [ -d ".git" ]; then
    success "Repositório Git inicializado"
    
    # Check remote
    if git remote -v | grep -q "github.com"; then
        success "Remote GitHub configurado"
    else
        warning "Remote GitHub não encontrado"
    fi
else
    error "Não é um repositório Git"
fi

echo ""
echo "📋 Resumo:"
echo "   Para fazer o primeiro push e acionar o CI:"
echo "   $ git add ."
echo "   $ git commit -m 'ci: configurar GitHub Actions para gerar APK'"
echo "   $ git push origin main"
echo ""
echo "   Depois, acesse: https://github.com/BusKa-org/buska-frontend/actions"
echo ""
