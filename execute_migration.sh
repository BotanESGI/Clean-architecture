#!/bin/bash
# Script pour exécuter la migration group_messages

echo "Exécution de la migration pour créer la table group_messages..."

# Si vous utilisez Docker
if docker ps | grep -q cleanarch-mysql; then
    echo "Exécution via Docker..."
    docker exec -i cleanarch-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD:-root} clean_architecture_db < migration_group_messages.sql
    echo "✅ Migration exécutée via Docker"
else
    echo "Exécution locale..."
    mysql -u root -p clean_architecture_db < migration_group_messages.sql
    echo "✅ Migration exécutée localement"
fi
