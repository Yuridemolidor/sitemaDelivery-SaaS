#!/usr/bin/env python3
"""
Script para configurar o banco de dados PostgreSQL
"""

import psycopg2
from psycopg2 import sql
import os

def setup_database():
    # Primeiro, conectar com o postgres padrão para criar o banco
    try:
        print("🔄 Conectando ao PostgreSQL...\n")
        
        # Conectar como postgres
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="123456",
            port=5432
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Verificar se banco existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'delivery_saas'")
        exists = cursor.fetchone()
        
        if not exists:
            print("📦 Criando banco de dados delivery_saas...")
            cursor.execute("CREATE DATABASE delivery_saas")
            print("✅ Banco criado com sucesso!\n")
        else:
            print("⚠️  Banco delivery_saas já existe\n")
        
        cursor.close()
        conn.close()
        
        # Agora conectar ao novo banco
        print("🔄 Criando tabelas...\n")
        
        conn = psycopg2.connect(
            host="localhost",
            database="delivery_saas",
            user="postgres",
            password="123456",
            port=5432
        )
        cursor = conn.cursor()
        
        # Ler arquivo SQL
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sql_file = os.path.join(os.path.dirname(script_dir), 'database.sql')
        
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Executar comandos SQL
        commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
        
        for command in commands:
            try:
                cursor.execute(command)
            except Exception as e:
                if 'already exists' not in str(e):
                    print(f"⚠️  {str(e)[:100]}")
        
        conn.commit()
        
        print("✅ Tabelas criadas com sucesso!\n")
        
        # Verificar dados
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM planos")
        planos_count = cursor.fetchone()[0]
        
        print("📊 Status do banco:\n")
        print(f"  ✓ Usuários: {users_count}")
        print(f"  ✓ Planos: {planos_count}\n")
        
        print("👤 Credenciais de Admin:\n")
        print("  Email: admin@delivery.com")
        print("  Senha: admin123\n")
        
        cursor.close()
        conn.close()
        
        print("✨ Banco de dados configurado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print("\n📝 Verifique se:")
        print("  • PostgreSQL está rodando")
        print("  • A senha do postgres é '123456'")
        print("  • Você tem permissão para conectar")

if __name__ == "__main__":
    setup_database()
