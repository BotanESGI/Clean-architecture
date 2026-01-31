#!/bin/bash
# Script pour exécuter la migration group_messages

echo "🔧 Exécution de la migration pour créer la table group_messages..."

# Vérifier si Docker est utilisé
if docker ps 2>/dev/null | grep -q cleanarch-mysql; then
    echo "📦 Exécution via Docker..."
    docker exec -i cleanarch-mysql mysql -u root -proot clean_architecture_db < migration_group_messages.sql
    if [ $? -eq 0 ]; then
        echo "✅ Migration exécutée avec succès via Docker"
    else
        echo "❌ Erreur lors de l'exécution via Docker"
        exit 1
    fi
elif docker ps 2>/dev/null | grep -q mysql; then
    CONTAINER_NAME=$(docker ps --filter "name=mysql" --format "{{.Names}}" | head -1)
    echo "📦 Exécution via Docker (container: $CONTAINER_NAME)..."
    docker exec -i $CONTAINER_NAME mysql -u root -proot clean_architecture_db < migration_group_messages.sql
    if [ $? -eq 0 ]; then
        echo "✅ Migration exécutée avec succès via Docker"
    else
        echo "❌ Erreur lors de l'exécution via Docker"
        exit 1
    fi
else
    echo "💻 Exécution locale MySQL..."
    echo "⚠️  Assurez-vous que MySQL est en cours d'exécution et que vous avez les bonnes identifiants"
    mysql -u root -p clean_architecture_db < migration_group_messages.sql
    if [ $? -eq 0 ]; then
        echo "✅ Migration exécutée avec succès localement"
    else
        echo "❌ Erreur lors de l'exécution locale"
        echo "💡 Essayez manuellement: mysql -u root -p clean_architecture_db < migration_group_messages.sql"
        exit 1
    fi
fi
