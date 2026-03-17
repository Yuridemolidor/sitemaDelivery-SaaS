const { Pool } = require('pg');
const fs = require('fs');

async function setupDatabase() {
    const adminPool = new Pool({
        user: 'postgres',
        host: 'localhost',
        password: '123456',
        port: 5432
    });

    try {
        console.log('🔄 Conectando ao PostgreSQL...\n');
        
        // Verificar se banco já existe
        const result = await adminPool.query(
            "SELECT 1 FROM pg_database WHERE datname = 'delivery_saas'"
        );

        if (result.rows.length === 0) {
            console.log('📦 Criando banco de dados delivery_saas...');
            await adminPool.query('CREATE DATABASE delivery_saas');
            console.log('✅ Banco criado com sucesso!\n');
        } else {
            console.log('⚠️  Banco delivery_saas já existe\n');
        }

        await adminPool.end();

        // Conectar ao novo banco
        const dbPool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'delivery_saas',
            password: '123456',
            port: 5432
        });

        console.log('🔄 Criando tabelas...\n');

        // Ler e executar SQL
        const sqlFile = fs.readFileSync(__dirname + '/database.sql', 'utf8');
        const commands = sqlFile.split(';').filter(cmd => cmd.trim().length > 0);

        for (const command of commands) {
            try {
                await dbPool.query(command);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.error('❌ Erro:', error.message);
                }
            }
        }

        console.log('✅ Tabelas criadas com sucesso!\n');

        // Verificar dados
        const users = await dbPool.query('SELECT COUNT(*) FROM users');
        const planos = await dbPool.query('SELECT COUNT(*) FROM planos');

        console.log('📊 Status do banco:\n');
        console.log(`  ✓ Usuários: ${users.rows[0].count}`);
        console.log(`  ✓ Planos: ${planos.rows[0].count}\n`);

        console.log('👤 Credenciais de Admin:\n');
        console.log('  Email: admin@delivery.com');
        console.log('  Senha: admin123\n');

        await dbPool.end();
        console.log('✨ Banco de dados configurado com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

setupDatabase();
