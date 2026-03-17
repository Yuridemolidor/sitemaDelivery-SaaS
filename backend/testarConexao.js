const { Pool } = require("pg");

// Configuração de conexão
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "delivery_saas",
    password: "123456",
    port: 5432
});

// Teste de conexão
async function testarConexao() {
    try {
        console.log("🔍 Testando conexão com o banco de dados...\n");
        
        const result = await pool.query("SELECT NOW()");
        console.log("✅ Conexão estabelecida com sucesso!");
        console.log(`Data/Hora do servidor: ${result.rows[0].now}\n`);

        // Verificar tabelas
        console.log("📊 Verificando tabelas...\n");
        
        const tabelas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log("Tabelas encontradas:");
        tabelas.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.table_name}`);
        });

        // Contar registros
        console.log("\n📈 Registros no banco:\n");
        
        const usuarios = await pool.query("SELECT COUNT(*) as count FROM users");
        console.log(`  • Usuários: ${usuarios.rows[0].count}`);
        
        const planos = await pool.query("SELECT COUNT(*) as count FROM planos");
        console.log(`  • Planos: ${planos.rows[0].count}`);
        
        const lojas = await pool.query("SELECT COUNT(*) as count FROM lojas");
        console.log(`  • Lojas: ${lojas.rows[0].count}`);
        
        const produtos = await pool.query("SELECT COUNT(*) as count FROM produtos");
        console.log(`  • Produtos: ${produtos.rows[0].count}`);
        
        const pedidos = await pool.query("SELECT COUNT(*) as count FROM pedidos");
        console.log(`  • Pedidos: ${pedidos.rows[0].count}`);

        // Exibir admin padrão
        console.log("\n👤 Usuário Admin Padrão:\n");
        const admin = await pool.query("SELECT id, nome, email, tipo FROM users WHERE tipo = 'admin'");
        if(admin.rows.length > 0) {
            console.log(`  • ID: ${admin.rows[0].id}`);
            console.log(`  • Nome: ${admin.rows[0].nome}`);
            console.log(`  • Email: ${admin.rows[0].email}`);
            console.log(`  • Tipo: ${admin.rows[0].tipo}`);
            console.log(`  • Senha: admin123`);
        }

        // Exibir planos
        console.log("\n💳 Planos Disponíveis:\n");
        const planosData = await pool.query("SELECT id, nome, preco, limite_produtos FROM planos ORDER BY preco");
        planosData.rows.forEach((plano) => {
            console.log(`  ${plano.id}. ${plano.nome}`);
            console.log(`     Preço: R$ ${plano.preco}`);
            console.log(`     Limite: ${plano.limite_produtos === -1 ? 'Ilimitado' : plano.limite_produtos} produtos\n`);
        });

        console.log("✨ Tudo pronto para começar!\n");
        
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:");
        console.error(`   ${error.message}\n`);
        console.error("Verifique se:");
        console.error("  • PostgreSQL está rodando");
        console.error("  • O banco 'delivery_saas' foi criado");
        console.error("  • As credenciais estão corretas (user: postgres, password: 123456)\n");
    } finally {
        await pool.end();
    }
}

testarConexao();
