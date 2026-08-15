const express = require('express');
const app = express();

app.use(express.json());

// 1. BASE DE DADOS DE LICENÇAS E IPS
const licencasValidas = {
    "CHAVE-CLIENTE-1": { 
        cliente: "Servidor Exemplo 1", 
        ipAutorizado: "185.228.83.45", 
        ativa: true 
    },
    "CHAVE-TOMAS-BYTEOPS": { 
        cliente: "Servidor do Tomás", 
        ipAutorizado: "127.0.0.1", 
        ativa: true 
    }
};

// 2. CÓDIGO LUA REAL DO ANTI-CHEAT
const codigoAntiCheatRemoto = `
    print("^2[ByteOps Anti-Cheat]^7 Todos os módulos de servidor foram carregados remotamente com sucesso!")

    RegisterNetEvent("byteops_anticheat:checkPlayer")
    AddEventHandler("byteops_anticheat:checkPlayer", function()
        local src = source
    end)
`;

// 3. ROTA DE VERIFICAÇÃO DE LICENÇA E IP
app.post('/api/v1/verify', (req, res) => {
    const { key } = req.body;
    
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientIp = rawIp ? rawIp.split(',')[0].trim() : '';

    console.log(`[LOG] Validação | Chave: ${key} | IP: ${clientIp}`);

    const licenca = licencasValidas[key];

    if (!licenca || !licenca.ativa) {
        return res.status(403).json({ error: "Licença inválida ou expirada." });
    }

    if (licenca.ipAutorizado !== clientIp) {
        console.log(`[BLOQUEADO] IP não autorizado: ${clientIp}`);
        return res.status(403).json({ error: "IP não autorizado para esta licença." });
    }

    console.log(`[SUCESSO] Aprovado para: ${licenca.cliente}`);
    return res.status(200).send(codigoAntiCheatRemoto);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[ByteOps API] Servidor a rodar na porta ${PORT}`);
});
