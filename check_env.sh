#!/bin/bash

# Скрипт для проверки .env файла на сервере
# Использование: ./check_env.sh

echo "🔍 Проверка .env файла"
echo ""

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo ""
    echo "Создайте .env файл:"
    echo "  cp env.example .env"
    echo "  nano .env"
    exit 1
fi

echo "✅ Файл .env найден"
echo ""

# Проверка обязательных переменных
echo "📋 Проверка обязательных переменных:"
echo ""

REQUIRED_VARS=(
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
    "POSTGRES_HOST"
    "POSTGRES_PGDATA"
    "JWT_SECRET"
    "REACT_APP_API_URL"
)

ALL_OK=true

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d'=' -f2-)
        if [ -z "$value" ]; then
            echo "  ⚠️  $var: установлен, но пустой"
            ALL_OK=false
        else
            # Скрываем чувствительные данные
            if [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"SECRET"* ]]; then
                masked_value=$(echo "$value" | sed 's/./*/g' | head -c 20)
                echo "  ✅ $var: $masked_value... (скрыто)"
            else
                echo "  ✅ $var: $value"
            fi
        fi
    else
        echo "  ❌ $var: не найден"
        ALL_OK=false
    fi
done

echo ""

# Специальная проверка REACT_APP_API_URL
echo "🔍 Детальная проверка REACT_APP_API_URL:"
REACT_URL=$(grep "^REACT_APP_API_URL=" .env | cut -d'=' -f2-)
if [ -z "$REACT_URL" ]; then
    echo "  ❌ REACT_APP_API_URL не установлен"
    ALL_OK=false
elif [ "$REACT_URL" = "https://api.sirazovdenis.nomorepartiessbs.ru" ]; then
    echo "  ✅ REACT_APP_API_URL установлен правильно: $REACT_URL"
elif [[ "$REACT_URL" == *"api.sirazovdenis.nomorepartiessbs.ru"* ]]; then
    echo "  ✅ REACT_APP_API_URL содержит правильный домен: $REACT_URL"
else
    echo "  ⚠️  REACT_APP_API_URL установлен, но может быть неправильным:"
    echo "      Текущее значение: $REACT_URL"
    echo "      Ожидаемое: https://api.sirazovdenis.nomorepartiessbs.ru"
    echo ""
    read -p "Исправить автоматически? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru|" .env
        echo "  ✅ Исправлено!"
    else
        ALL_OK=false
    fi
fi

echo ""

# Итоговый результат
if [ "$ALL_OK" = true ]; then
    echo "✅ Все проверки пройдены!"
    echo ""
    echo "📋 Текущие значения (без паролей):"
    grep -E "^POSTGRES_USER=|^POSTGRES_DB=|^POSTGRES_HOST=|^REACT_APP_API_URL=" .env | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/SECRET=.*/SECRET=***/'
else
    echo "⚠️  Обнаружены проблемы в .env файле"
    echo ""
    echo "Исправьте проблемы и запустите проверку снова:"
    echo "  nano .env"
    echo "  ./check_env.sh"
    exit 1
fi
